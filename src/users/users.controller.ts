import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";

@Controller('users')
export class UsersController {
	@UseGuards(JwtAuthGuard)
	@Get('me')
	getProfile(@Req() req:any) {
		return 3
	}
}