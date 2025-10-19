import { BadRequestException, Injectable } from "@nestjs/common";
import { SessionUser } from "src/auth/interfaces/session-user.interface";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class DashboardService {
	constructor(private readonly prisma: PrismaService) { }

	async getActiveUsers(companyId: string) {
		if (!companyId) throw new BadRequestException('Usuário sem empresa associada')

		const oneWeekAgo = new Date()
		oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

		return this.prisma.user.findMany({
			where: {
				companyId,
				lastLogin: {
					gte: oneWeekAgo
				}
			},
			select: {
				id: true,
				name: true,
				email: true,
				office: true,
				lastLogin: true,
			},
			orderBy: {
				lastLogin: 'desc',
			},
		})
	}

	async getDeliveriesHistory(user: SessionUser, days?: string) {
		const companyId = user.companyId

		if (!companyId) throw new BadRequestException("Usuário sem empresa associada.")

		const daysNumber = Number(days) || 15
		const startDate = new Date()
		startDate.setDate(startDate.getDate() - daysNumber)

		const deliveries = await this.prisma.delivery.groupBy({
			by: ['expectedAt'],
			_count: { id: true },
			where: {
				createdAt: { gte: startDate },
				companyId
			},
			orderBy: {
				expectedAt: 'asc'
			}
		})

		return deliveries.map((entry) => ({
			date: entry.expectedAt.toISOString().split('T')[0],
			count: entry._count.id
		}))
	}

	async getLateDeliveries(companyId: string) {
		const now = new Date()

		const lateDeliveries = await this.prisma.delivery.findMany({
			where: {
				expectedAt: { lt: now },
				status: 'PENDING',
				companyId
			},
			include: {
				product: true,
				supplier: true
			}
		})

		return lateDeliveries

	}

	async getOverdueInvoices(companyId: string) {
		const now = new Date()

		const invoices = await this.prisma.supplierInvoice.findMany({
			where: {
				dueDate: { lt: now },
				status: 'PENDING',
				companyId
			},
			include: {
				supplier: true
			}
		})

		return invoices
	}

	async getRecentMovements(companyId: string) {
		const movements = await this.prisma.stockMovement.findMany({
			where: { companyId },
			orderBy: { createdAt: 'asc' },
			take: 5,
			include: {
				product: true,
				originWareHouse: true,
				destinationWarehouse: true
			}
		})

		return movements
	}

	async getStockMovementHistory(user: SessionUser, days?: string) {
		const companyId = user.companyId

		if (!companyId) throw new BadRequestException("Usuário sem companhia associada.")

		const daysNumber = Number(days || 15)
		const startDate = new Date()
		startDate.setDate(startDate.getDate() - daysNumber)

		const movements = await this.prisma.stockMovement.findMany({
			where: {
				createdAt: {
					gte: startDate
				},
				companyId
			}, orderBy: {
				createdAt: 'asc'
			},
			select: {
				createdAt: true,
				type: true
			}
		})

		const grouped: Record<string, { IN: number; OUT: number; TRANSFER: number }> = {}

		for (const movement of movements) {
			const date = movement.createdAt.toISOString().split('T')[0]
			if (!grouped[date]) {
				grouped[date] = { IN: 0, OUT: 0, TRANSFER: 0 }
			}

			grouped[date][movement.type]++
		}

		return Object.entries(grouped).map(([date, counts]) => ({
			date,
			...counts,
		}))

	}

	async getTotalProducts(user: SessionUser) {
		const companyId = user.companyId

		if (!companyId) throw new BadRequestException("Usuário sem companhia associada.")

		const count = await this.prisma.product.count({
			where: { companyId }
		})

		return count
	}

	async getTotalWarehouses(user: SessionUser) {
		const companyId = user.companyId

		if (!companyId) throw new BadRequestException("Usuário sem companhia associada.")

		const count = await this.prisma.wareHouse.count({
			where: { companyId }
		})

		return count
	}

	async getUpcomingDeliveries(user: SessionUser) {
		const companyId = user.companyId

		if (!companyId) throw new BadRequestException("Usuário sem companhia associada.")

		const deliveries = await this.prisma.delivery.findMany({
			where: {
				expectedAt: {
					gte: new Date(),
				},
				status: 'PENDING',
				companyId,
			},
			orderBy: { expectedAt: 'asc' },
			take: 5,
			include: {
				product: true,
				supplier: true,
			},
		})

		return deliveries
	}
}