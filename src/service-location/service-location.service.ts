import { Injectable, NotFoundException } from "@nestjs/common";
import { AuditLogService } from "src/audit-log/audit_log.service";
import { NotificationService } from "src/notification/notification.service";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateServiceLocationDto } from "./dto/create-service-location.dto";
import { SessionUser } from "src/auth/interfaces/session-user.interface";
import { UpdateServiceLocationDto } from "./dto/update-service-location.dto";

@Injectable()
export class ServiceLocationService {
	constructor(
		private prisma: PrismaService,
		private notifyService: NotificationService,
		private auditService: AuditLogService
	) { }

	async create(dto: CreateServiceLocationDto, user: SessionUser) {
		const companyId = user.companyId

		const newLocation = await this.prisma.serviceLocation.create({
			data: {
				name: dto.name,
				address: dto.address,
				companyId
			}
		})

		await this.notifyService.notifyByRole({
			title: 'Novo local de serviço criado',
			message: `Local "${newLocation.name}" adicionado.`,
			roles: ['GESTOR'],
		})

		await this.notifyService.notifyByRole({
			title: 'Local de serviço criado por gestor',
			message: `${user.name} criou o local "${newLocation.name}".`,
			roles: ['ADMIN'],
		})

		return newLocation
	}

	async findAll(user: SessionUser) {
		const companyId = user.companyId

		return this.prisma.serviceLocation.findMany({
			where: { companyId },
			orderBy: { name: 'asc' }
		})
	}

	async findOne(id: string, user: SessionUser) {
		const companyId = user.companyId

		const serviceLocation = await this.prisma.serviceLocation.findUnique({
			where: { id, companyId }
		})

		if (!serviceLocation) throw new NotFoundException("Local de serviço não encontrado.")

		return serviceLocation
	}

	async update(
		id: string,
		dto: UpdateServiceLocationDto,
		user: SessionUser
	) {
		const companyId = user.companyId

		const updated = await this.prisma.serviceLocation.update({
			where: { id, companyId },
			data: dto
		})

		await this.auditService.createAuditLog({
			companyId,
			userId: user.id,
			action: 'update',
			entity: 'serviceLocate',
			entityId: updated.id,
			description: `Local de serviço alterado: ${updated.name}`,
		})

		return updated
	}

	async remove(id: string, user: SessionUser) {
		const companyId = user.companyId

		await this.prisma.serviceLocation.delete({
			where: { id, companyId }
		})

		await this.auditService.createAuditLog({
			companyId,
			userId: user.id,
			action: 'delete',
			entity: 'serviceLocate',
			entityId: id,
			description: `Local de serviço excluído: ${id}`,
		})

		return { message: 'Local de serviço deletado com sucesso.' }
	}
}