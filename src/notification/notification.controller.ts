import { Controller, Delete, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { GetUser } from "src/auth/decorators/get-user.decorator";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { SessionUser } from "src/auth/interfaces/session-user.interface";
import { NotificationService } from "./notification.service";

@Controller('notification')
@UseGuards(JwtAuthGuard)
export class NotificationController {
	constructor(private readonly notificationService: NotificationService) { }

	@Get()
	async getUserNotifications(@GetUser() user: SessionUser) {
		return this.notificationService.getUserNotifications(user)
	}

	@Patch('read-all')
	async markAllAsRead(@GetUser() user: SessionUser) {
		return this.notificationService.markAllAsRead(user)
	}

	@Delete(':id')
	async deleteNotification(
		@Param('id') id: string,
		@GetUser() user: SessionUser
	) {
		return this.notificationService.deleteNotification(id, user)
	}

	@Patch(':id/read')
	async markAsRead(
		@Param('id') id: string,
		@GetUser() user: SessionUser
	) {
		return this.notificationService.markAsRead(id, user)
	}
}