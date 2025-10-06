import { Module } from "@nestjs/common";
import { CategoryController } from "./category.controller";
import { CategoryService } from "./category.service";
import { PrismaService } from "src/prisma/prisma.service";
import { AuditLogService } from "src/audit-log/audit_log.service";
import { AuditLogModule } from "src/audit-log/audit_log.module";

@Module({
	imports: [AuditLogModule],
	controllers: [CategoryController],
	providers: [CategoryService, PrismaService, AuditLogService]
})

export class CategoryModule {}