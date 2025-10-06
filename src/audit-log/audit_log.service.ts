import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateAuditLogDto } from "./dto/create_audit_log.dto";

@Injectable()
export class AuditLogService {
	private readonly logger = new Logger(AuditLogService.name)

	constructor(private readonly prisma: PrismaService) { }

	async findAll() {
		return this.prisma.auditLog.findMany({
			orderBy: { createdAt: "desc" },
			include: {
				user: {
					select: { email: true, name: true, office: true }
				}
			}
		})
	}

	async createAuditLog(data: CreateAuditLogDto) {
		try {
			await this.prisma.auditLog.create({
				data: {
					companyId: data.companyId,
					userId: data.userId,
					action: data.action,
					entity: data.entity,
					entityId: data.entityId,
					description: data.description ?? '',
				},
			})

			this.logger.debug(
				`Log registrado: ${data.action} em ${data.entity} por ${data.userId}`,
			)

		} catch (error) {
			this.logger.error('Erro ao registrar log de auditoria: ', error)
		}
	}
}