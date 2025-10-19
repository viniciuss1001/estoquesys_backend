import { Module } from "@nestjs/common";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { PrismaService } from "src/prisma/prisma.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";

@Module({
	controllers: [DashboardController],
	providers: [DashboardService, PrismaService, JwtAuthGuard]
})

export class DashboardModule {}
