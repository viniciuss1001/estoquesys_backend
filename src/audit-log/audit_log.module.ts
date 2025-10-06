import { Module } from "@nestjs/common";
import { AuditLogController } from "./audit_log.controller";
import { AuditLogService } from "./audit_log.service";
import { PrismaService } from "src/prisma/prisma.service";

@Module({
	controllers: [AuditLogController],
	providers: [AuditLogService, PrismaService], 
	exports: [AuditLogService]
})

export class AuditLogModule {}