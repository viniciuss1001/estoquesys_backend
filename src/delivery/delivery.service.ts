import { AuditLogService } from "src/audit-log/audit_log.service";
import { NotificationService } from "src/notification/notification.service";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateDeliveryDto } from "./dto/create-delivery.dto";
import { SessionUser } from "src/auth/interfaces/session-user.interface";
import { ForbiddenException, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { UpdateDeliveryDto } from "./dto/update-delivery.dto";

export class DeliveryService {
	constructor(
		private prisma: PrismaService,
		private auditLog: AuditLogService,
		private notification: NotificationService
	) { }

	async create(dto: CreateDeliveryDto, user: SessionUser) {
		try {
			const expectedAt = new Date(dto.expectedAt)

			const delivery = await this.prisma.delivery.create({
				data: {
					quantity: Number(dto.quantity),
					expectedAt,
					product: {
						connect: { id: dto.productId }
					},
					supplier: {
						connect: { id: dto.supplierId }
					},
					warehouse: {
						connect: { id: dto.warehouseId }
					},
					supplierInvoice: dto.supplierInvoiceId ? { connect: { id: dto.supplierInvoiceId } } : undefined,
					company: {
						connect: { id: user.companyId }
					}
				}
			})

			// notifications
			await this.notification.notifyByRole({
				title: 'Nova entrega adicionada',
				message: `Entrega prevista para ${delivery.expectedAt.toISOString()}`,
				roles: ['GESTOR'],
				companyId: user.companyId,
			})

			await this.notification.notifyByRole({
				title: 'Entrega registrada por Gestor',
				message: `${user.name} criou uma nova entrega.`,
				roles: ['ADMIN'],
				companyId: user.companyId,
			})

			// audit
			const product = await this.prisma.product.findUnique({
				where: { id: dto.productId }, select: { name: true }
			})

			await this.auditLog.createAuditLog({
				companyId: user.companyId,
				userId: user.id,
				action: 'create',
				entity: 'delivery',
				entityId: delivery.id,
				description: `Entrega criada para o produto ${product?.name ?? dto.productId} com quantidade ${dto.quantity}`,
			})

			return delivery

		} catch (error) {
			console.error("Erro ao criar entrega, ", error)
			throw new InternalServerErrorException("Erro ao criar entrega.")
		}
	}

	async findAll(filters: { productId?: string; supplierId?: string; warehouseId?: string; status?: string; companyId: string }) {
		try {
			const where: any = {
				companyId: filters.companyId,
				...(filters.productId && { productId: filters.productId }),
				...(filters.supplierId && { supplierId: filters.supplierId }),
				...(filters.warehouseId && { warehouseId: filters.warehouseId }),
				...(filters.status && { status: filters.status }),
			}

			const deliveries = await this.prisma.delivery.findMany({
				where,
				orderBy: { createdAt: 'desc' },
				include: {
					product: { select: { id: true, name: true } },
					supplier: { select: { id: true, name: true } },
					warehouse: { select: { id: true, name: true } },
					supplierInvoice: { select: { id: true, title: true } },
				}
			})

			return deliveries

		} catch (error) {
			console.error('Erro ao buscar entregas, ', error)
			throw new InternalServerErrorException("Erro ao buscar entregas.")
		}
	}

	async findOne(id: string, companyId: string) {
		return this.prisma.delivery.findUnique({
			where: { id, companyId },
			include: {
				product: true,
				supplier: true,
				supplierInvoice: true,
				warehouse: true
			}
		})
	}

	// update with stock adjustments
	async update(id: string, dto: UpdateDeliveryDto, user: SessionUser) {
		try {
			// load existing delivery
			const existing = await this.prisma.delivery.findUnique({
				where: { id, companyId: user.companyId },
				include: { product: true },
			});
			if (!existing) throw new NotFoundException('Entrega não encontrada.');

			// Prepare updated data
			const data: any = {};
			if (dto.quantity !== undefined) data.quantity = dto.quantity;
			if (dto.expectedAt) data.expectedAt = new Date(dto.expectedAt);
			if (dto.status) data.status = dto.status;
			if (dto.productId) data.product = { connect: { id: dto.productId } };
			if (dto.supplierId) data.supplier = { connect: { id: dto.supplierId } };
			if (dto.warehouseId) data.warehouse = { connect: { id: dto.warehouseId } };
			if (dto.supplierInvoiceId) data.supplierInvoice = { connect: { id: dto.supplierInvoiceId } };

			// We'll run transactional logic if status change affects stock
			const result = await this.prisma.$transaction(async (tx) => {
				const updated = await tx.delivery.update({
					where: { id, companyId: user.companyId } as any,
					data,
					include: { product: true, supplierInvoice: true, supplier: true, warehouse: true },
				});

				// Stock adjustment logic:
				const wasCompleted = existing.status === 'COMPLETED';
				const isNowCompleted = dto.status === 'COMPLETED';
				const sameProduct = !dto.productId || dto.productId === existing.productId;
				const productId = dto.productId ?? existing.productId;
				const warehouseId = dto.warehouseId ?? existing.warehouseId;
				const qty = dto.quantity ?? existing.quantity;

				// If same product and warehouse present, adjust accordingly
				if (productId && qty && warehouseId && sameProduct) {
					// completed now -> increment
					if (!wasCompleted && isNowCompleted) {
						await tx.product.update({
							where: { id: productId },
							data: { quantity: { increment: qty } },
						});
						await tx.warehouseProduct.upsert({
							where: {
								warehouseId_productId: { warehouseId, productId },
							},
							create: {
								warehouseId,
								productId,
								quantity: qty,
							},
							update: {
								quantity: { increment: qty },
							},
						});
					}

					// was completed -> now not completed -> decrement
					if (wasCompleted && !isNowCompleted) {
						await tx.product.update({
							where: { id: productId },
							data: { quantity: { decrement: qty } },
						});
						await tx.warehouseProduct.update({
							where: {
								warehouseId_productId: { warehouseId, productId },
							},
							data: {
								quantity: { decrement: qty },
							},
						});
					}
				}

				return updated;
			});

			// audit
			await this.auditLog.createAuditLog({
				companyId: user.companyId,
				userId: user.id,
				action: 'update',
				entity: 'delivery',
				entityId: result.id,
				description: `Entrega alterada para o produto ${data.product?.connect?.id ?? existing.productId} com quantidade ${data.quantity ?? existing.quantity}`,
			});

			return result;
		} catch (error) {
			console.error('Erro ao atualizar entrega:', error);
			throw new InternalServerErrorException('Erro ao atualizar entrega');
		}
	}

	async remove(id: string, user: SessionUser) {
		// Only admin allowed at controller level but double-check
		const delivery = await this.prisma.delivery.findUnique({ where: { id } });
		if (!delivery) throw new NotFoundException('Entrega não encontrada.');
		if (delivery.companyId !== user.companyId) throw new ForbiddenException('Operação proibida.');

		try {
			await this.prisma.delivery.delete({ where: { id } });
			await this.auditLog.createAuditLog({
				companyId: user.companyId,
				userId: user.id,
				action: 'delete',
				entity: 'delivery',
				entityId: id,
				description: 'Entrega excluída',
			});
			return { message: 'Entrega excluída com sucesso!' };
		} catch (error) {
			console.error('Erro ao deletar entrega:', error);
			throw new InternalServerErrorException('Erro ao deletar entrega');
		}
	}
}
