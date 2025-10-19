import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { PrismaService } from './prisma/prisma.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';

@Module({
  imports: [AuthModule, CompaniesModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, JwtAuthGuard],
  exports: [JwtModule, AuthGuard]
})
export class AppModule {}
