import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { AuditLogService } from "src/audit-log/audit_log.service";
import { SessionUser } from "src/auth/interfaces/session-user.interface";
import { NotificationService } from "src/notification/notification.service";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ProductService {
	constructor(
		private prisma: PrismaService,
		private logService: AuditLogService,
		private notificationService: NotificationService
	) { }

	async createProduct(data: any, userId: string, companyId: string) {
		const category = data.category
			? await this.prisma.category.findUnique({ where: { id: data.category } })
			: null

		const productData: any = {
			name: data.name,
			sku: data.sku,
			supplier: data.supplier ? { connect: { id: data.supplier } } : undefined,
			price: data.price,
			quantity: data.quantity,
			unit: data.unit,
			usageStatus: data.usageStatus,
			categoryId: category?.id,
			companyId,
			expirationDate:
				category?.name === 'Perecível' && data.expirationDate
					? new Date(data.expirationDate)
					: undefined,
		}

		const product = await this.prisma.product.create({ data: productData });

		// registra no warehouseProduct
		await this.prisma.warehouseProduct.create({
			data: {
				productId: product.id,
				warehouseId: data.warehouse,
				quantity: data.quantity,
			},
		})

		// cria movimento inicial IN
		await this.prisma.stockMovement.create({
			data: {
				type: 'IN',
				quantity: data.quantity,
				productId: product.id,
				originWarehouseId: null,
				destinationWarehouseId: data.warehouse,
				status: 'COMPLETED',
				companyId,
			},
		})

		await this.notificationService.notifyByRole({
			title: 'Novo produto criado',
			message: `Produto ${product.name} criado.`,
			roles: ['GESTOR']
		})

		await this.notificationService.notifyByRole({
			title: 'Produto criado por gestor',
			message: `Usuário ${userId} criou um produto.`,
			roles: ['ADMIN']
		})

		// log
		await this.logService.createAuditLog({
			companyId,
			userId,
			action: 'create',
			entity: 'product',
			entityId: product.id,
			description: `Produto criado: ${product.name}`,
		});

		return product;
	}

	async findAllProducts(companyId: string, filters: any) {
		const { categoryId, supplierId, usageStatus, warehouseId } = filters;

		const where: any = {
			...(categoryId && { categoryId }),
			...(supplierId && { supplierId }),
			...(usageStatus && { usageStatus }),
			companyId,
		};

		return this.prisma.product.findMany({
			where,
			include: {
				category: true,
				supplier: true,
				warehouseProduct: warehouseId
					? {
						where: { warehouseId },
						select: { quantity: true },
					}
					: false,
			},
		})
	}

	async findById(productId: string, companyId: string) {
		const product = await this.prisma.product.findUnique({
			where: {
				id: productId,
				companyId
			},
			include: {
				category: true,
				supplier: true,
				warehouseProduct: {
					include: {
						warehouse: true
					}
				}
			}
		})

		if (!product) throw new NotFoundException('Produto não encontrado.')

		return product
	}

	async updateProduct(productId: string, companyId: string, data: any, user: SessionUser) {
		const updatedData: any = {
			name: data.name,
			sku: data.sku,
			quantity: Number(data.quantity),
			price: Number(data.price),
			minimumStock: data.minimumStock !== undefined ? Number(data.minimumStock) : undefined,
		}

		if (data.category) updatedData.category = { connect: { id: data.category } }
		if (data.supplier) updatedData.supplier = { connect: { id: data.supplier } }
		if (data.warehouse) updatedData.warehouse = { connect: { id: data.warehouse } }

		const product = await this.prisma.product.update({
			where: { id: productId, companyId },
			data: updatedData
		})

		await this.logService.createAuditLog({
			companyId,
			userId: user.id,
			action: 'update',
			entity: 'product',
			entityId: product.id,
			description: `Produto alterado: ${product.name}`,
		})

		return product
	}

	async deleteProduct(productId: string, companyId: string, userId: string, isAdmin: boolean) {
		if (!isAdmin) throw new BadRequestException('Usuário não autorizado.')

		await this.prisma.product.delete({
			where: {
				id: productId
			}
		})

		await this.logService.createAuditLog({
			companyId,
			userId,
			action: 'delete',
			entity: 'product',
			entityId: productId,
			description: `Produto deletado: ${productId}`,
		})

		return { message: 'Produto deletado com sucesso' }
	}

	async getLowStockProducts(companyId: string) {
		const products = await this.prisma.product.findMany({
			where: {
				minimumStock: { gt: 0 }, companyId
			},
			select: {
				id: true,
				name: true,
				quantity: true,
				minimumStock: true
			}
		})

		return products.filter(
			(p) => p.quantity <= (p.minimumStock ?? 0)
		)
	}

	async getMovements(productId: string) {
		return this.prisma.stockMovement.findMany({
			where: { productId },
			orderBy: { createdAt: 'desc' },
			include: {
				originWareHouse: true,
				destinationWarehouse: true
			}
		})
	}

	async getWarehouseStock(productId: string) {
		return this.prisma.warehouseProduct.findMany({
			where: { productId },
			include: {
				warehouse: true
			}
		})
	}

}