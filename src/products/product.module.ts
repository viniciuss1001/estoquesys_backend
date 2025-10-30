import { Module } from "@nestjs/common";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";
import { PrismaService } from "src/prisma/prisma.service";
import { AuditLogService } from "src/audit-log/audit_log.service";
import { NotificationService } from "src/notification/notification.service";

@Module({
	controllers: [ProductController],
	providers: [ProductService, PrismaService, AuditLogService, NotificationService],
	exports: [ProductService]
})

export class ProductModule { }