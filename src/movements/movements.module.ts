import { Module } from "@nestjs/common";
import { StockMovementsController } from "./movements.controller";
import { StockMovementService } from "./movements.service";
import { PrismaService } from "src/prisma/prisma.service";
import { AuditLogService } from "src/audit-log/audit_log.service";

@Module({
	controllers: [StockMovementsController],
	providers: [StockMovementService, PrismaService, AuditLogService],
	exports: [StockMovementService]
})

export class StockMovementsModule { }