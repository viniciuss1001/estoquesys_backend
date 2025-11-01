import { Module } from "@nestjs/common";
import { AuditLogService } from "src/audit-log/audit_log.service";
import { NotificationService } from "src/notification/notification.service";
import { PrismaService } from "src/prisma/prisma.service";
import { ServiceProviderController } from "./service-provider.controller";
import { ServiceProviderService } from "./service-provider.service";

@Module({
	controllers: [ServiceProviderController],
	providers: [ServiceProviderService, PrismaService, AuditLogService, NotificationService]
})

export class ServiceProviderModule { }