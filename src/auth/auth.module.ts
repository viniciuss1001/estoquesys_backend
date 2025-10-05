import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { AuthController } from "./auth.controller";
import { PrismaService } from "src/prisma/prisma.service";
import { UsersModule } from "src/users/users.module";
import { PassportModule } from "@nestjs/passport";

@Module({
	imports: [
		UsersModule,
		PassportModule,
		JwtModule.register({
			secret: process.env.JWT_SECRET,
			signOptions: { expiresIn: '1d' },
		})
	], 
	controllers: [
		AuthController
	],
	providers: [AuthService, JwtStrategy, PrismaService],
	exports: [AuthService]
})

export class AuthModule {}