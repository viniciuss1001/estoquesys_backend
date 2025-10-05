import { BadRequestException, Body, ConflictException, Controller, InternalServerErrorException, NotFoundException, Post } from "@nestjs/common";
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

	@Post('validate')
	async validateCompany(@Body() body: {cnpj: string}) {
		const {cnpj} = body;

		if(!cnpj) throw new BadRequestException("CNPJ é obrigatório.")

		try {
			const company = await this.companiesService.findByCnpj(cnpj)

			if(!company) throw new NotFoundException('Empresa não encontrada.')

			return company;

		} catch (error) {
			console.error('Erro ao validar CNPJ:', error)

			throw new InternalServerErrorException("erro interno do servidor.")
		}
	}
}