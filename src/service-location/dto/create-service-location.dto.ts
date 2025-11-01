import { IsNotEmpty, IsString } from "class-validator";

export class CreateServiceLocationDto {
	@IsString()
	@IsNotEmpty()
	name: string

	@IsString()
	@IsNotEmpty()
	address: string
}