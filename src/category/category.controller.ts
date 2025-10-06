import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { Request } from "express";
import { RequestWithUSer } from "src/common/interfaces/request-with-user.interface";

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoryController {
	constructor(private readonly categoryService: CategoryService) { }

	@UseGuards(JwtAuthGuard)
	@Post()
	async create(@Body() body: { name: string }, @Req() req: Request) {
		const user = req.user as any

		if (!user.companyId) throw new BadRequestException('Usuário sem empresa associada.')

		return this.categoryService.create(body.name, user.companyId, user.id)
	}

	@UseGuards(JwtAuthGuard)
	@Get()
	async findAll(@Req() req: Request) {
		const user = req.user as any

		if (!user.companyId) throw new BadRequestException('Usuário sem empresa associada.')

		return this.categoryService.findAll(user.companyId)
	}

	@UseGuards(JwtAuthGuard)
	@Patch(':id')
	async updateCategory(
		@Param('id') id: string,
		@Body() body: { name: string },
		@Req() req: RequestWithUSer
	) {
		const user = req.user

		if (!user.companyId) throw new UnauthorizedException('Usuário sem empresa associada.')

		return this.categoryService.updateCategory(id, body.name, user)
	}

	@UseGuards(JwtAuthGuard)
	@Delete(':id')
	async deleteCategory(
		@Param('id') id: string,
		@Req() req: RequestWithUSer
	) {
		const user = req.user;
		if (!user.companyId)
			throw new BadRequestException('Usuário sem empresa associada.');

		await this.categoryService.deleteCategory(id, user);
		return { message: 'Categoria deletada com sucesso.' };
	}

}