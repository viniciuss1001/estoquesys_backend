import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { SessionUser } from "src/auth/interfaces/session-user.interface";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class NotificationService {
	constructor(private readonly prisma: PrismaService) { }

	async getUserNotifications(user: SessionUser) {
		const notifications = await this.prisma.notification.findMany({
			where: { userId: user.id },
			orderBy: { createdAt: 'desc' },
			take: 5
		})

		return notifications
	}

	async markAllAsRead(user: SessionUser) {
		await this.prisma.notification.updateMany({
			where: { userId: user.id, read: false },
			data: { read: true }
		})

		return { message: 'Todas as notificações foram marcadas como lidas.' }
	}

	async deleteNotification(id: string, user: SessionUser) {
		const notification = await this.prisma.notification.findUnique({
			where: { id }
		})

		if (!notification) throw new NotFoundException('Notificação não encontrada.')

		if (notification.userId !== user.id) throw new ForbiddenException('Acesso negado.')

		await this.prisma.notification.delete({ where: { id } })

		return { message: 'Notificação excluída com sucesso.' }

	}

	async markAsRead(id: string, user: SessionUser) {
		const notification = await this.prisma.notification.updateMany({
			where: { id, userId: user.id },
			data: { read: true },
		})

		if (notification.count === 0) {
			throw new NotFoundException('Notificação não encontrada ou não pertence a este usuário.')
		}

		return { message: 'Notificação marcada como lida.' }
	}
}