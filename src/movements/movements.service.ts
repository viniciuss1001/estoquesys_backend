import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { AuditLogService } from "src/audit-log/audit_log.service";
import { NotificationService } from "src/notification/notification.service";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateStockMovementDto } from "./dto/create-stock-movement.dto";
import { SessionUser } from "src/auth/interfaces/session-user.interface";
import { FilterStockMovementDto } from "./dto/filter-stock-movement.dto";
import { UpdateStockMovementDto } from "./dto/update-stock-movement.dto";

@Injectable()
export class StockMovementService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly logService: AuditLogService,
		private readonly notificationService: NotificationService
	) { }

	async create(dto: CreateStockMovementDto, user: SessionUser) {
		const { companyId } = user

		const { productId, quantity, type, originWarehouseId, destinationWarehouseId, status, notes } = dto


		if (status !== 'CANCELED' && quantity <= 0) throw new BadRequestException('Quantidade deve ser maior do que zero.')

		let quantityBefore = 0
		let quantityAfter = 0

		// verifica antes de debitar
		if (status === 'COMPLETED' && (type === 'OUT' || type === 'TRANSFER')) {
			if (!originWarehouseId) throw new BadRequestException('Armazém de origem obrigatória.')

			const stock = await this.prisma.warehouseProduct.findUnique({
				where: {
					warehouseId_productId: {
						warehouseId: originWarehouseId,
						productId,
					},
				},
			})

			if (!stock || stock.quantity < quantity) {
				throw new BadRequestException('Estoque insuficiente no armazém.')
			}
		}

		// atomic transaction
		return this.prisma.$transaction(async (tx) => {
			if (status === 'COMPLETED') {
				switch (type) {
					case 'IN': {
						if (!destinationWarehouseId)
							throw new BadRequestException('Destino obrigatório para entrada.');

						const destStock = await tx.warehouseProduct.findUnique({
							where: {
								warehouseId_productId: {
									warehouseId: destinationWarehouseId,
									productId,
								},
							},
						});

						quantityBefore = destStock?.quantity ?? 0;
						quantityAfter = quantityBefore + quantity;

						await tx.warehouseProduct.upsert({
							where: {
								warehouseId_productId: {
									warehouseId: destinationWarehouseId,
									productId,
								},
							},
							update: { quantity: quantityAfter },
							create: { productId, warehouseId: destinationWarehouseId, quantity: quantityAfter },
						});

						await tx.product.update({
							where: { id: productId },
							data: { quantity: { increment: quantity } },
						});
						break;
					}

					case 'OUT': {
						if (!originWarehouseId)
							throw new BadRequestException('Origem obrigatória para saída.');

						const originStock = await tx.warehouseProduct.findUnique({
							where: {
								warehouseId_productId: {
									warehouseId: originWarehouseId,
									productId,
								},
							},
						});

						if (!originStock || originStock.quantity < quantity)
							throw new BadRequestException('Estoque insuficiente no armazém de origem.');

						quantityBefore = originStock.quantity;
						quantityAfter = quantityBefore - quantity;

						await tx.warehouseProduct.update({
							where: {
								warehouseId_productId: {
									warehouseId: originWarehouseId,
									productId,
								},
							},
							data: { quantity: quantityAfter },
						});

						await tx.product.update({
							where: { id: productId },
							data: { quantity: { decrement: quantity } },
						});
						break;
					}

					case 'TRANSFER': {
						if (!originWarehouseId || !destinationWarehouseId)
							throw new BadRequestException('Origem e destino obrigatórios para transferência.');

						const originStock = await tx.warehouseProduct.findUnique({
							where: {
								warehouseId_productId: {
									warehouseId: originWarehouseId,
									productId,
								},
							},
						});

						if (!originStock || originStock.quantity < quantity)
							throw new BadRequestException('Estoque insuficiente para transferência.');

						await tx.warehouseProduct.update({
							where: {
								warehouseId_productId: {
									warehouseId: originWarehouseId,
									productId,
								},
							},
							data: { quantity: { decrement: quantity } },
						});

						await tx.warehouseProduct.upsert({
							where: {
								warehouseId_productId: {
									warehouseId: destinationWarehouseId,
									productId,
								},
							},
							update: { quantity: { increment: quantity } },
							create: { productId, warehouseId: destinationWarehouseId, quantity },
						});

						break;
					}
				}
			}

			const movement = await tx.stockMovement.create({
				data: {
					productId,
					quantity,
					type,
					originWarehouseId: type === 'IN' ? null : originWarehouseId,
					destinationWarehouseId: type === 'OUT' ? null : destinationWarehouseId,
					notes,
					status,
					quantityBefore,
					quantityAfter,
					companyId,
				},
			});

			await this.notificationService.notifyByRole({
				title: 'Nova movimentação criada',
				message: `Movimentação criada com destino para ${destinationWarehouseId}`,
				roles: ['GESTOR'],
				companyId,
			});

			await this.notificationService.notifyByRole({
				title: 'Movimentação criada por gestor',
				message: `${user.name} criou uma movimentação.`,
				roles: ['ADMIN'],
				companyId,
			});

			await this.logService.createAuditLog({
				companyId,
				userId: user.id,
				action: 'create',
				entity: 'movement',
				entityId: movement.id,
				description: `Movimentação ${type} de ${quantity} unidades`,
			});

			return movement;
		});
	}

	async findAll(filters: FilterStockMovementDto, companyId: string) {
		const { productId, type, status, originWarehouseId, destinationWarehouseId } = filters;

		return this.prisma.stockMovement.findMany({
			where: {
				companyId,
				...(productId && { productId }),
				...(type && { type }),
				...(status && { status }),
				...(originWarehouseId && { originWarehouseId }),
				...(destinationWarehouseId && { destinationWarehouseId }),
			},
			orderBy: { createdAt: 'desc' },
			include: {
				product: { select: { id: true, name: true } },
				originWareHouse: { select: { id: true, name: true } },
				destinationWarehouse: { select: { id: true, name: true } },
			},
		});
	}

	async update(id: string, dto: UpdateStockMovementDto, user: SessionUser) {
		const existingMovement = await this.prisma.stockMovement.findUnique({
			where: { id }
		})

		if (!existingMovement) throw new NotFoundException("Movimentação não encontrada.")
		const productId = existingMovement.productId

		// reverter movimentação anterior se estava COMPLETED
		if (existingMovement.status === 'COMPLETED' && existingMovement.type === 'TRANSFER') {
			if (existingMovement.originWarehouseId) {
				await this.prisma.warehouseProduct.update({
					where: { warehouseId_productId: { warehouseId: existingMovement.originWarehouseId, productId } },
					data: { quantity: { increment: existingMovement.quantity } },
				});
			}
			if (existingMovement.destinationWarehouseId) {
				await this.prisma.warehouseProduct.update({
					where: { warehouseId_productId: { warehouseId: existingMovement.destinationWarehouseId, productId } },
					data: { quantity: { decrement: existingMovement.quantity } },
				});
			}
		}

		// Verificar estoque para transferência
		if (dto.status === 'COMPLETED' && dto.type === 'TRANSFER') {
			if (!dto.originWarehouseId || !dto.destinationWarehouseId) {
				throw new BadRequestException('Armazéns obrigatórios para transferência');
			}

			const originStock = await this.prisma.warehouseProduct.findUnique({
				where: { warehouseId_productId: { warehouseId: dto.originWarehouseId, productId } },
			});

			if (!originStock || originStock.quantity < dto.quantity!) {
				throw new BadRequestException('Estoque insuficiente no armazém de origem');
			}
		}
		// Aplicar efeito da nova movimentação se COMPLETED
		if (dto.status === 'COMPLETED' && dto.type === 'TRANSFER') {
			await this.prisma.warehouseProduct.update({
				where: { warehouseId_productId: { warehouseId: dto.originWarehouseId!, productId } },
				data: { quantity: { decrement: dto.quantity } },
			})

			await this.prisma.warehouseProduct.upsert({
				where: { warehouseId_productId: { warehouseId: dto.destinationWarehouseId!, productId } },
				update: { quantity: { increment: dto.quantity } },
				create: { warehouseId: dto.destinationWarehouseId!, productId, quantity: dto.quantity },
			})
		}

		const updatedMovement = await this.prisma.stockMovement.update({
			where: { id, companyId: user.companyId },
			data: {
				...dto,
			},
		})

		await this.logService.createAuditLog({
			companyId: user.companyId,
			userId: user.id,
			action: 'update',
			entity: 'movement',
			entityId: updatedMovement.id,
			description: `Movimentação alterada: ${updatedMovement.id}`,
		})

		return updatedMovement
	}

	async remove(id: string, session: any) {
		await this.prisma.stockMovement.delete({ where: { id } });

		await this.logService.createAuditLog({
			companyId: session.companyId,
			userId: session.user.id,
			action: 'delete',
			entity: 'movement',
			entityId: id,
			description: `Movimentação Apagada: ${id}`,
		});
	}
	async findOne(id: string, companyId: string) {
		return this.prisma.stockMovement.findUnique({
			where: { id, companyId },
			include: {
				originWareHouse: true,
				destinationWarehouse: true,
				product: true,
			},
		});
	}
}



