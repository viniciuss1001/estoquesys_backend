import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { ServiceProviderService } from "./service-provider.service";
import { CreateServiceProviderDto } from "./dto/create-service-provider.dto";
import { SessionUser } from "src/auth/interfaces/session-user.interface";
import { Session } from "inspector/promises";
import { UpdateServiceProviderDto } from "./dto/update-service-provider.dto";

@Controller('service-provider')
@UseGuards(JwtAuthGuard)
export class ServiceProviderController {
	constructor(
		private readonly serviceProviderService: ServiceProviderService
	) { }

	@Post()
	async create(
		@Body() dto: CreateServiceProviderDto,
		user: SessionUser
	) {
		return this.serviceProviderService.create(dto, user)
	}

	@Get()
	async findAll(user: SessionUser) {
		return this.serviceProviderService.findAll(user)
	}

	@Get(':id')
	async findOne(
		@Param('id') id: string,
		user: SessionUser
	) {
		return this.serviceProviderService.findOne(id, user)
	}

	@Patch(':id')
	async update(
		@Param('id') id: string,
		@Body() dto: UpdateServiceProviderDto,
		user: SessionUser
	) {
		return this.serviceProviderService.update(id, dto, user)
	}

	@Delete(':id')
	remove(
		@Param('id') id: string, user: SessionUser) {
		return this.serviceProviderService.remove(id, user);
	}
}