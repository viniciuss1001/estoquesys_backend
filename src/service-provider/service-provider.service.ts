import { Injectable, NotFoundException } from "@nestjs/common";
import { AuditLogService } from "src/audit-log/audit_log.service";
import { NotificationService } from "src/notification/notification.service";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateServiceProviderDto } from "./dto/create-service-provider.dto";
import { SessionUser } from "src/auth/interfaces/session-user.interface";
import { UpdateServiceProviderDto } from "./dto/update-service-provider.dto";
import { dot } from "node:test/reporters";

@Injectable()
export class ServiceProviderService {
	constructor(
		private prisma: PrismaService,
		private notifyService: NotificationService,
		private auditService: AuditLogService
	) { }

	async create(dto: CreateServiceProviderDto, user: SessionUser) {
		const companyId = user.companyId

		const newProvider = await this.prisma.serviceProvider.create({
			data: {
				...dto,
				companyId
			}
		})

		await this.notifyService.notifyByRole({
			title: 'Novo prestador de serviço criado',
			message: `Provedor ${newProvider.name} criado.`,
			roles: ['GESTOR'],
		})

		await this.notifyService.notifyByRole({
			title: 'Prestador de serviço criado por gestor',
			message: `${user.name} criou um prestador de serviço.`,
			roles: ['ADMIN'],
		})

		return newProvider

	}

	async findAll(user: SessionUser) {
		const companyId = user.companyId

		return this.prisma.serviceProvider.findMany({
			where: { companyId },
			orderBy: { name: 'asc' }
		})
	}

	async findOne(id: string, user: SessionUser) {
		const companyId = user.companyId

		const provider = await this.prisma.serviceProvider.findUnique({
			where: {
				id, companyId
			}
		})

		if (!provider) throw new NotFoundException("Prestador de serviço não encontrado.")

		return provider
	}

	async update(
		id: string,
		dto: UpdateServiceProviderDto,
		user: SessionUser
	) {
		const companyId = user.companyId

		const updatedProvider = await this.prisma.serviceProvider.update({
			where: { id, companyId },
			data: dto
		})

		await this.auditService.createAuditLog({
			companyId,
			userId: user.id,
			action: 'update',
			entity: 'serviceProvider',
			entityId: updatedProvider.id,
			description: `Prestador de serviço alterado: ${updatedProvider.name}`,
		});

		return updatedProvider
	}

	async remove(id: string, user: SessionUser) {
		const companyId = user.companyId;

		await this.prisma.serviceProvider.delete({
			where: { id, companyId },
		});

		await this.auditService.createAuditLog({
			companyId,
			userId: user.id,
			action: 'delete',
			entity: 'serviceProvider',
			entityId: id,
			description: `Prestador de serviço excluído: ${id}`,
		});

		return { message: 'Prestador de serviço deletado com sucesso.' };
	}
}