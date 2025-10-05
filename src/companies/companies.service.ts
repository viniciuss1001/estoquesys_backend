import { ConflictException, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class CompaniesService {
	constructor(private prisma: PrismaService) {}

	async createCompany(data: Prisma.CompanyCreateInput) {
		const existing = await this.prisma.company.findUnique({
			where: {
				cnpj: data.cnpj 
			}
		})

		if(existing) {
			throw new ConflictException('Empresa com este CNPJ já está cadastrada.')
		}

		return this.prisma.company.create({
			data
		});
	}

	async findByCnpj(cnpj: string) {
		return this.prisma.company.findUnique({
			where: {cnpj}, 
			select: {
				id: true, 
				name: true, 
				cnpj: true
			}
		})
	}
}