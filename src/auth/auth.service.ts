import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { JwtService } from '@nestjs/jwt'
import { RegisterDto } from "./dto/register.dto";
import * as bcrypt from 'bcrypt'
import { LoginDto } from "./dto/login.dto";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class AuthService {
	constructor(
		private userService: UsersService,
		private jwtService: JwtService,
		private prisma: PrismaService
	) { }

	async validadeUser(email: string, password: string) {
		const user = await this.prisma.user.findUnique({
			where: {
				email
			}
		})
		if (!user) throw new UnauthorizedException('Email or password is wrong')

		const isPasswordValid = await bcrypt.compare(password, user.password)
		if (!isPasswordValid) throw new UnauthorizedException('Password is wrong')

		// update laslogin of user
		await this.prisma.user.update({
			where: { id: user.id },
			data: {
				lastLogin: new Date()
			}
		})

		return user;
	}

	async register(data: RegisterDto) {
		const {
			name, email, password, office, phone, department, description, companyId
		} = data;

		if (!email || !password || !companyId) {
			throw new BadRequestException('Email, password and company is necessary.')
		}

		const existingUser = await this.prisma.user.findUnique({
			where: {
				email
			}
		})
		if (existingUser) throw new BadRequestException('User already exists')

		const company = await this.prisma.company.findUnique({
			where: {
				id: companyId
			}
		})

		if (!company) throw new NotFoundException('Company not found.')

		const hashedPassword = await bcrypt.hash(password, 10)

		await this.prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
				office: office === 'ADMIN' ? 'ADMIN' : 'GESTOR',
				phone,
				department,
				description,
				companyId,
			}
		})

		return { message: "Usuário criado com sucesso!"}

	}

	async login(data: LoginDto) {
		const user = await this.validadeUser(data.email, data.password)

		const payload = {
			id: user.id,
			name: user.name,
			email: user.email,
			office: user.office
		}

		const token = await this.jwtService.signAsync(payload, {
			secret: process.env.JWT_SECRET,
			expiresIn: '1d',
		})

		return { token }

	}

	async logout() {
		return {message: "Logout"}
	}

}