import { BadRequestException, Body, ConflictException, Controller, InternalServerErrorException, Post } from "@nestjs/common";
import { CompaniesService } from "./companies.service";

@Controller('companies')
export class CompaniesController {
	constructor(private readonly companiesService: CompaniesService) {}

	@Post()
	async createCompany(
		@Body()
		body: {
			cnpj: string
			name: string
			corporateName?: string
		}
	) {
		const {cnpj, name, corporateName} = body;

		if(!cnpj || !name) throw new BadRequestException('CNPJ e Nome da Empresa são obrigatórios.')

			try {
				const company = await this.companiesService.createCompany({
					cnpj, name, corporateName
				})

				return company;

			} catch (error) {
				if(error.code === 'p2002') {
					// erro do Prisma de unique constraint
					throw new ConflictException('Empresa com esse CNPJ já cadastrada.')
				}

				throw new InternalServerErrorException('Erro do servidor ao criar companhia.')
			}
	}
}