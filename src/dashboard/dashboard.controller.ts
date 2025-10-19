import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { Getuser } from "src/auth/decorators/get-user.decorator";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { SessionUser } from "src/auth/interfaces/session-user.interface";
import { RequestWithUSer } from "src/common/interfaces/request-with-user.interface";
import { DashboardService } from "./dashboard.service";

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
	constructor(private readonly dashboardService: DashboardService) { }

	@Get('active-users')
	async getActiveUsers(@Req() req: RequestWithUSer) {
		const { companyId } = req.user

		return this.dashboardService.getActiveUsers(companyId!)
	}

	@Get('deliveries-history')
	async getDeliveriesHistory(
		@Query('days') days?: string,
		@Getuser() user?: SessionUser
	) {
		return this.dashboardService.getDeliveriesHistory(user!, days)
	}
}