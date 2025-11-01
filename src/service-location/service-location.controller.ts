import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { ServiceLocationService } from "./service-location.service";
import { CreateServiceLocationDto } from "./dto/create-service-location.dto";
import { SessionUser } from "src/auth/interfaces/session-user.interface";
import { UpdateServiceLocationDto } from "./dto/update-service-location.dto";

@Controller('service-location')
@UseGuards(JwtAuthGuard)
export class ServiceLocationController {
	constructor(
		private readonly serviceLocationService: ServiceLocationService
	) { }

	@Post()
	async create(@Body() dto: CreateServiceLocationDto, user: SessionUser) {
		return this.serviceLocationService.create(dto, user)
	}

	@Get()
	async findAll(user: SessionUser) {
		return this.serviceLocationService.findAll(user)
	}

	@Get('id')
	async findOne(@Param('id') id: string, user: SessionUser) {
		return this.serviceLocationService.findOne(id, user)
	}

	@Patch(':id')
	async update(
		@Param('id') id: string,
		@Body() dto: UpdateServiceLocationDto,
		user: SessionUser
	) {
		return this.serviceLocationService.update(id, dto, user)
	}

	@Delete(':id')
	async remove(
		@Param('id') id: string,
		user:SessionUser
	){
		return this.serviceLocationService.remove(id, user)
	}
}