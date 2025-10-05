import { Module } from "@nestjs/common";
import { CompaniesController } from "./companies.controller";
import { CompaniesService } from "./companies.service";
import { PrismaService } from "src/prisma/prisma.service";

@Module({
	controllers: [CompaniesController],
	providers: [CompaniesService, PrismaService], 
	exports: [CompaniesService]
})

export class CompaniesModule {}