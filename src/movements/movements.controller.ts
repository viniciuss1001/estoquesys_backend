import { BadRequestException, Body, Controller, Delete, Get, InternalServerErrorException, NotFoundException, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { StockMovementService } from "./movements.service";
import { CreateStockMovementDto } from "./dto/create-stock-movement.dto";
import { FilterStockMovementDto } from "./dto/filter-stock-movement.dto";
import { UpdateStockMovementDto } from "./dto/update-stock-movement.dto";

@Controller('movements')
@UseGuards(JwtAuthGuard)
export class StockMovementsController {
	constructor(
		private readonly stockMovementsService: StockMovementService
	) { }

	@Post()
	async create(@Req() req, @Body() dto: CreateStockMovementDto) {
		const session = req.user

		if (!session?.companyId) {
			throw new BadRequestException('Usuário sem empresa associada.')
		}

		return this.stockMovementsService.create(dto, session)
	}

	@Get()
	async findAll(@Req() req, @Query() filters: FilterStockMovementDto) {
		const session = req.user

		if (!session?.companyId) {
			throw new BadRequestException('Usuário sem empresa associada.')
		}

		return this.stockMovementsService.findAll(filters, session.companyId)
	}
	@Get(':id')
	async findOne(@Req() req, @Param('id') id: string) {
		const session = req.user;
		if (!session?.companyId) throw new BadRequestException('Usuário sem empresa associada.');

		const movement = await this.stockMovementsService.findOne(id, session.companyId)
		if (!movement) throw new NotFoundException('Movimentação não encontrada.')
		return movement;
	}

	@Patch(':id')
	async update(@Req() req, @Param('id') id: string, @Body() dto: UpdateStockMovementDto) {
		const session = req.user;
		if (!session?.companyId) throw new BadRequestException('Usuário sem empresa associada.')

		try {
			return await this.stockMovementsService.update(id, dto, session)
		} catch (error) {
			throw new InternalServerErrorException('Erro ao atualizar movimentação')
		}
	}

	@Delete(':id')
	async remove(@Req() req, @Param('id') id: string) {
		const session = req.user
		if (!session?.companyId) throw new BadRequestException('Usuário sem empresa associada.')

		try {
			await this.stockMovementsService.remove(id, session);
			return { message: 'Movimentação deletada com sucesso' }
		} catch (error) {
			throw new InternalServerErrorException('Erro ao deletar movimentação.')
		}
	}
}
