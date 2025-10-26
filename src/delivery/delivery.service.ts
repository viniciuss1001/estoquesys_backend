import { AuditLogService } from "src/audit-log/audit_log.service";
import { NotificationService } from "src/notification/notification.service";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateDeliveryDto } from "./dto/create-delivery.dto";
import { SessionUser } from "src/auth/interfaces/session-user.interface";
import { InternalServerErrorException } from "@nestjs/common";

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
		
	}
}