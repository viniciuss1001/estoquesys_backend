import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class AuditLogService {
	constructor(private prisma: PrismaService) { }

	async findAll() {
		return this.prisma.auditLog.findMany({
			orderBy: { createdAt: "desc" },
			include: {
				user: {
					select: { email: true, name: true, office: true}
				}
			}
		})
	}
}