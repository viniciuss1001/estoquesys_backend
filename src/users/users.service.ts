import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UsersService {
	constructor(
		private prisma: PrismaService
	) {}

	async create(data: any) {
		return this.prisma.user.create({data})
	}

	async findByEmail(email:string) {
		return this.prisma.user.findUnique({
			where: {
				email
			}
		})
	}
}