import {
	IsString,
	IsNumber,
	IsOptional,
	IsUUID,
	IsEnum,
	IsDateString,
	IsPositive,
} from 'class-validator';

export enum UsageStatus {
	IN_STOCK = 'Em estoque',
	IN_USE = 'Em uso',
	CONSUMED = 'Consumido'
}

export class CreateProductDto {
	@IsString()
	name: string;

	@IsString()
	sku: string;

	@IsOptional()
	@IsUUID()
	category?: string;

	@IsOptional()
	@IsUUID()
	supplier?: string;

	@IsNumber()
	@IsPositive()
	price: number;

	@IsNumber()
	quantity: number;

	@IsString()
	unit: string;

	@IsOptional()
	@IsEnum(UsageStatus)
	usageStatus?: UsageStatus;

	@IsOptional()
	@IsDateString()
	expirationDate?: string;

	@IsUUID()
	warehouse: string;

	@IsOptional()
	@IsNumber()
	minimumStock?: number;
}
