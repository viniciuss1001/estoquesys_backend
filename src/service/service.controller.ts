import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { ServiceService } from "./service.service";
import { CreateServiceDto } from "./dto/create-service.dto";
import { SessionUser } from "src/auth/interfaces/session-user.interface";
import { UpdateServiceDto } from "./dto/update-service.dto";

@Controller('services')
@UseGuards(JwtAuthGuard)
export class ServiceController {
	constructor(
		private readonly serviceService: ServiceService
	) { }

	@Post()
	async create(
		@Body() dto: CreateServiceDto,
		user: SessionUser
	) {
		return this.serviceService.create(dto, user)
	}

	@Get()
	async findAll(
		user: SessionUser,
		@Query() query: any
	) {
		return this.serviceService.findAll(user, query)
	}

	@Get(':id')
	async findOne(
		@Param('id') id: string,
		user: SessionUser
	) {
		return this.serviceService.findOne(id, user)
	}

	@Patch(':id')
	async update(
		@Param(':id') id: string,
		@Body() dto: UpdateServiceDto,
		user: SessionUser
	) {
		return this.serviceService.update(id, dto, user)
	}

	@Delete(':id')
	async remove(
		@Param('id') id: string,
		user: SessionUser
	) {
		return this.serviceService.remove(id, user)
	}
}