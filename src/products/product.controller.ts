import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { ProductService } from "./product.service";


@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductController {
	constructor(
		private readonly productsService: ProductService
	) { }

	@Post()
	async createProduct(@Body() body: any, @Req() req) {
		const companyId = req.user;
		const userId = req.user.id;
		return this.productsService.createProduct(body, userId, companyId)
	}

	@Get()
	async getProducts(
		@Req() req,
		@Query('categoryId') categoryId?: string,
		@Query('supplierId') supplierId?: string,
		@Query('status') usageStatus?: string,
		@Query('warehouseId') warehouseId?: string,
	) {
		const companyId = req.user.companyId
		const filters = { categoryId, supplierId, usageStatus, warehouseId }
		return this.productsService.findAllProducts(companyId, filters)
	}
	@Get('low-stock')
	async getLowStock(@Req() req) {
		const companyId = req.user.companyId
		return this.productsService.getLowStockProducts(companyId)
	}

	@Get(':id')
	async getProduct(@Param('id') id: string, @Req() req) {
		const companyId = req.user.companyId
		return this.productsService.findById(id, companyId)
	}

	@Patch(':id')
	async updateProduct(@Param('id') id: string, @Body() body: any, @Req() req) {
		const companyId = req.user.companyId;
		const userId = req.user.id
		return this.productsService.updateProduct(id, companyId, body, userId)
	}

	@Delete(':id')
	async deleteProduct(@Param('id') id: string, @Req() req) {
		const companyId = req.user.companyId;
		const userId = req.user.id;
		const isAdmin = req.user.office === 'ADMIN'
		return this.productsService.deleteProduct(id, companyId, userId, isAdmin)
	}

	@Get(':id/movements')
	async getMovements(@Param('id') id: string) {
		return this.productsService.getMovements(id)
	}

	@Get(':id/warehouses')
	async getWarehousesStock(@Param('id') id: string) {
		return this.productsService.getWarehouseStock(id)
	}
}