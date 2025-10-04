import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import {JwtService} from '@nestjs/jwt'
import { RegisterDto } from "./dto/register.dto";
import * as bcrypt from 'bcrypt'
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
	constructor(
		private userService: UsersService,
		private jwtService: JwtService
	) {}

	async register(data: RegisterDto){
		const hashed = await bcrypt.hash(data.password, 10);

		const user = await this.userService.create({
			...data, 
			password: hashed
		})

		return this.generateToken(user);
	}

	async login(data:LoginDto){
		const user = await this.userService.findByEmail(data.email)
		if(!user) throw new UnauthorizedException("Invalid Credentials")

		const isValid = await bcrypt.compare(data.password, user.password)
		if(!isValid) throw new UnauthorizedException("Invalid credentials")

		return this.generateToken(user)
	}


	private generateToken(user:any){
		const payload = {sub: user.id, email: user.email}

		return {
			access_token: this.jwtService.sign(payload)
		}
	}
}