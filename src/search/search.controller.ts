import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { SearchService } from "./search.service";
import { SessionUser } from "src/auth/interfaces/session-user.interface";

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
	constructor(
		private readonly searchService: SearchService
	) { }

	@Get()
	async search(@Query('q') query: string, @Req() req, user: SessionUser) {
		const companyId = user.companyId

		return this.searchService.search(companyId, query)
	}
}