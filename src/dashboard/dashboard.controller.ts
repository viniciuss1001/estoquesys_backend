import { BadRequestException, Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { GetUser } from "src/auth/decorators/get-user.decorator";
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
		@GetUser() user?: SessionUser
	) {
		return this.dashboardService.getDeliveriesHistory(user!, days)
	}

	@Get()
	async getlateDeliveries(@GetUser() user: SessionUser) {
		if (!user.companyId) throw new BadRequestException("Usuário sem empresa associada.")

		return this.dashboardService.getLateDeliveries(user.companyId)
	}

	@Get('overdue-invoice')
	async getOverdueInvoices(@GetUser() user: SessionUser) {
		if (!user.companyId) throw new BadRequestException("Usuáro sem companhia associada.")

		return this.dashboardService.getOverdueInvoices(user.companyId)
	}

	@Get('recent-movements')
	async getRecentMovements(@GetUser() user: SessionUser) {
		if (!user.companyId) throw new BadRequestException("Usuáro sem companhia associada.")

		return this.dashboardService.getRecentMovements(user.companyId)
	}

	@Get('stock-movements-history')
	async getStockMovementsHistory(
		@GetUser() user: SessionUser,
		@Query('days') days?: string
	) {
		return this.dashboardService.getStockMovementHistory(user, days)
	}

	@Get('total-products')
	async getTotalProducts(@GetUser() user: SessionUser) {
		return this.dashboardService.getTotalProducts(user)
	}

	@Get('total-warehouses')
	async getTotalWarehouses(@GetUser() user:SessionUser) {
		return this.dashboardService.getTotalWarehouses(user)
	}

	@Get('upcoming-deliveries')
	async getUpcomingDeliveries(@GetUser() user:SessionUser) {
		return this.dashboardService.getUpcomingDeliveries(user)
	}

}