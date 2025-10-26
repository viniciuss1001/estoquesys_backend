import { Module } from "@nestjs/common";
import { AuditLogModule } from "src/audit-log/audit_log.module";
import { NotificationModule } from "src/notification/notification.module";
import { PrismaService } from "src/prisma/prisma.service";
import { DeliveryController } from "./delivery.controller";
import { DeliveryService } from "./delivery.service";

@Module({
	imports: [AuditLogModule, NotificationModule],
	controllers: [DeliveryController],
	providers: [DeliveryService, PrismaService]
})
export class DeliveryModule { }