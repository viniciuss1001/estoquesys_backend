import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

@Controller('auth')
export class AuthController {
	constructor(
		private authService: AuthService
	) {}

	@Post('register')
	async register(@Body() data: RegisterDto) {
		return this.authService.register(data)
	}

	@Post('login')
	async login(@Body() data: LoginDto) {
		return this.authService.login(data)
	}

	@Post('logout')
	async logout() {
		return this.authService.logout()
	}
}