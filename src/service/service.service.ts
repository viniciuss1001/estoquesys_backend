import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { SessionUser } from "src/auth/interfaces/session-user.interface";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";

@Injectable()
@UseGuards(JwtAuthGuard)
export class ServiceService {
	constructor(
		private prisma: PrismaService
	) { }

	async create(dto: CreateServiceDto, user: SessionUser) {
		if (!user.companyId) throw new BadRequestException('Usuário sem empresa associada.')

		const service = await this.prisma.service.create({
			data: {
				serviceProviderId: dto.serviceProviderId,
				serviceTypeId: dto.serviceTypeId,
				serviceLocationId: dto.serviceLocationId,
				serviceDate: new Date(dto.serviceDate),
				cost: dto.cost || 0,
				status: 'PENDING',
				description: dto.description,
				attachmentUrl: dto.attachmentUrl || null,
				invoiceId: dto.invoiceId || null,
				createdByUserId: user.id,
				companyId: user.companyId,
			},
			include: {
				provider: true,
				type: true,
				location: true,
			},
		})

		return service

	}

	async findAll(user: SessionUser, filters: Record<string, string>) {
		if (!user.companyId) throw new BadRequestException('Usuário sem empresa associada.');

		const where: any = {
			companyId: user.companyId,
			...(filters.serviceProviderId && { serviceProviderId: filters.serviceProviderId }),
			...(filters.serviceTypeId && { serviceTypeId: filters.serviceTypeId }),
			...(filters.serviceLocationId && { serviceLocationId: filters.serviceLocationId }),
			...(filters.invoiceId && { invoiceId: filters.invoiceId }),
		};

		if (filters.startDate || filters.endDate) {
			where.serviceDate = {
				...(filters.startDate && { gte: new Date(filters.startDate) }),
				...(filters.endDate && { lte: new Date(filters.endDate) }),
			};
		}

		return this.prisma.service.findMany({
			where,
			include: {
				provider: { select: { id: true, name: true } },
				type: { select: { id: true, name: true } },
				location: { select: { id: true, name: true } },
				invoice: { select: { id: true, title: true } },
				createdByUser: { select: { id: true, name: true, email: true } },
			},
			orderBy: { serviceDate: 'asc' },
		})
	}

	async findOne(id: string, user: SessionUser) {
		if (!user.companyId) throw new BadRequestException('Usuário sem empresa associada.')
		const service = await this.prisma.service.findUnique({
			where: { id, companyId: user.companyId },
			include: {
				provider: true,
				type: true,
				location: true,
				invoice: true,
				createdByUser: { select: { id: true, name: true, email: true } },
			},
		});

		if (!service) throw new NotFoundException('Serviço não encontrado')
		return service;
	}

	async update(id: string, dto: UpdateServiceDto, user: SessionUser) {
		if (!user.companyId) throw new BadRequestException('Usuário sem empresa associada.');

		const updated = await this.prisma.service.update({
			where: { id, companyId: user.companyId },
			data: {
				serviceProviderId: dto.serviceProviderId,
				serviceTypeId: dto.serviceTypeId,
				serviceLocationId: dto.serviceLocationId,
				serviceDate: new Date(dto.serviceDate!),
				cost: Number(dto.cost),
				status: dto.status,
				description: dto.description,
				attachmentUrl: dto.attachmentUrl || null,
				invoiceId: dto.invoiceId || null,
			},
		})

		return updated
	}

	async remove(id: string, user: SessionUser) {
		if (!user.companyId) throw new BadRequestException('Usuário sem empresa associada.');
		if (user.office !== 'ADMIN') throw new ForbiddenException('Acesso negado.');

		await this.prisma.service.delete({
			where: { id, companyId: user.companyId },
		})

		return { message: `Serviço ${id} deletado com sucesso` }
	}
}