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
			_count: {id: true},
			where: {
				createdAt: {gte: startDate},
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
}