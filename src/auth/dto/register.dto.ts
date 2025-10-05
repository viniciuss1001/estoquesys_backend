import { Office } from '@prisma/client'
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator'

export class RegisterDto {
	@IsNotEmpty()
	@IsString()
	name: string

	@IsEmail()
	email: string

	@IsNotEmpty()
	@IsString()
	@MinLength(6)
	password: string

	@IsNotEmpty()
	@IsString()
	companyId: string

	@IsOptional()
	@IsString()
	phone?: string

	@IsOptional()
	@IsString()
	department?: string

	@IsOptional()
	@IsString()
	description?: string

	@IsOptional()
	office?: Office
}