import { BadRequestException, Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { Request } from "express";

@Controller('categories')
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

}