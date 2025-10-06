import { Controller, Get, InternalServerErrorException, UseGuards } from "@nestjs/common";
import { AuditLogService } from "./audit_log.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";

@Controller('audit-log')
export class AuditLogController {
	constructor(private readonly auditLogService: AuditLogService) {}

	@UseGuards(JwtAuthGuard)
	@Get()
	async findAll() {
		try {
			const logs = await this.auditLogService.findAll()

			return logs;
		} catch (error) {
			console.error('Erro ao buscar histórico de ações:', error)
			throw new InternalServerErrorException('Erro interno do servidor')
		}
	}
}