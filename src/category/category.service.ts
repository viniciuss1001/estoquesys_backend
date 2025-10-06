import { Injectable, InternalServerErrorException } from "@nestjs/common";
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

	async updateCategory(id: string, name: string, user: any) {
		try {
			const category = await this.prisma.category.update({
				where: { id },
				data: { name, companyId: user.companyId }
			})

			await this.auditLog.createAuditLog({
				companyId: user.companyId!,
				userId: user.id,
				action: 'update',
				entity: 'category',
				entityId: category.id,
				description: `Categoria alterada: ${category.name}`,
			})

			return category

		} catch (error) {
			console.error('Erro ao atualizar categoria:', error)
			throw new InternalServerErrorException('Erro interno do servidor')
		}
	}

	async deleteCategory(id: string, user: any) {
		try {
			//remove the reference of all products after delete
			await this.prisma.product.updateMany({
				where: {
					categoryId: id,
					companyId: user.companyId
				},
				data: {
					categoryId: null
				}
			})

			await this.prisma.category.delete({
				where: {
					id,
					companyId: user.companyId
				}
			})

			await this.auditLog.createAuditLog({
				companyId: user.companyId!,
				userId: user.id,
				action: 'delete',
				entity: 'category',
				entityId: id,
				description: `Categoria deletada: ${id}`,
			})

		} catch (error) {
			console.error('Erro ao deletar categoria:', error);
			throw new InternalServerErrorException('Erro ao deletar categoria.');
		}
	}
}