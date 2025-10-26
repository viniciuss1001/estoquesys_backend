import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { DeliveryService } from "./delivery.service";
import { CreateDeliveryDto } from "./dto/create-delivery.dto";
import { GetUser } from "src/auth/decorators/get-user.decorator";
import { SessionUser } from "src/auth/interfaces/session-user.interface";
import { UpdateDeliveryDto } from "./dto/update-delivery.dto";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorators";

@Controller('delivery')
@UseGuards(JwtAuthGuard)
export class DeliveryController {
	constructor(private readonly deliveryServices: DeliveryService) { }

	@Post()
	async create(
		@Body() dto: CreateDeliveryDto,
		@GetUser() user: SessionUser
	) {
		if (!user.companyId) throw new BadRequestException("Usuário sem empresa associada.")

		return this.deliveryServices.create(dto, user)
	}

	@Get()
	async findAll(
		@Query('productId') productId?: string,
		@Query('supplierId') supplierId?: string,
		@Query('warehouseId') warehouseId?: string,
		@Query('status') status?: string,
		@GetUser() user?: SessionUser,
	) {
		if (!user!.companyId) throw new BadRequestException('Usuário sem empresa associada.')
		return this.deliveryServices.findAll({ productId, supplierId, warehouseId, status, companyId: user!.companyId })
	}

	@Get(':id')
	async findOne(@Param('id') id: string, @GetUser() user: SessionUser) {
		if (!user.companyId) throw new BadRequestException('Usuário sem empresa associada.')
		const delivery = await this.deliveryServices.findOne(id, user.companyId)
		if (!delivery) throw new NotFoundException('Entrega não encontrada.')
		return delivery
	}

	@Patch(':id')
	async update(@Param('id') id: string, @Body() dto: UpdateDeliveryDto, @GetUser() user: SessionUser) {
		if (!user.companyId) throw new BadRequestException('Usuário sem empresa associada.');
		return this.deliveryServices.update(id, dto, user);
	}

	@UseGuards(RolesGuard)
	@Roles('ADMIN')
	@Delete(':id')
	async remove(@Param('id') id: string, @GetUser() user: SessionUser) {
		// RolesGuard + @Roles('ADMIN') garante autorização
		return this.deliveryServices.remove(id, user);
	}
}
