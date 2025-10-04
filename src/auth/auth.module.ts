import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
	imports: [
		//TODO: UsersModule,
		JwtModule.register({
			secret: process.env.JWT_SECRET || 'default_secret',
			signOptions: { expiresIn: '1d' },
		})
	], 
	providers: [AuthService, JwtStrategy],
	controllers: [
		// TODO: AuthController
	]
})

export class AuthModule {}