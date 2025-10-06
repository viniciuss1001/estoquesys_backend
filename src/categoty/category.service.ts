import { Injectable } from "@nestjs/common";
import { AuditLogService } from "src/audit-log/audit_log.service";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class CategoryService {
	constructor(
		private prisma: PrismaService,
		private auditLog: AuditLogService
	) { }

	async create(name: string, companyId: string, userId: string) {
		const category = await this.prisma.category.create({
			data: { name, companyId }
		})

		try {
			await this.auditLog.createAuditLog({
				companyId,
				userId,
				action: 'create',
				entity: 'category',
				entityId: category.id,
				description: `Categoria criada: ${category.name}`,
			})
		} catch (error) {
			console.error('Erro ao registrar o log da categoria: ', error)
		}

		return category
	}

	async findAll(companyId: string) {
		return this.prisma.category.findMany({
			where: { companyId },
			orderBy: { name: 'desc' },
			select: { id: true, name: true }
		})
	}
}