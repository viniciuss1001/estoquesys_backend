import { Module } from "@nestjs/common";
import { ServiceLocationController } from "./service-location.controller";
import { ServiceLocationService } from "./service-location.service";
import { PrismaService } from "src/prisma/prisma.service";
import { NotificationService } from "src/notification/notification.service";
import { AuditLogService } from "src/audit-log/audit_log.service";

@Module({
	controllers: [ServiceLocationController],
	providers: [ServiceLocationService, PrismaService, NotificationService, AuditLogService]
})

export class ServiceLocationModule { }