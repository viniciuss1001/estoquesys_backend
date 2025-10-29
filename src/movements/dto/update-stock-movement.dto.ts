import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class UpdateStockMovementDto {
	@IsOptional() @IsEnum(['IN', 'OUT', 'TRANSFER']) type?: 'IN' | 'OUT' | 'TRANSFER'
	@IsOptional() @IsNumber() @Min(1) quantity?: number
	@IsOptional() @IsUUID() originWarehouseId?: string
	@IsOptional() @IsUUID() destinationWarehouseId?: string
	@IsOptional() @IsString() notes?: string
	@IsOptional() @IsEnum(['PENDING', 'COMPLETED', 'CANCELED']) status?: 'PENDING' | 'COMPLETED' | 'CANCELED'
}