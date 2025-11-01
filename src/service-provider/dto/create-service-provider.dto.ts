import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateServiceProviderDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsEmail()
	@IsNotEmpty()
	email: string;

	@IsString()
	@IsNotEmpty()
	phone: string;

	@IsString()
	@IsOptional()
	cnpj?: string;

	@IsString()
	@IsOptional()
	description?: string;
}