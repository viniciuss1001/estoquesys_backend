import { IsEnum, IsOptional, IsUUID } from "class-validator";

export class FilterStockMovementDto {
	@IsOptional() @IsUUID() productId?: string
	@IsOptional() @IsUUID() originWarehouseId?: string
	@IsOptional() @IsUUID() destinationWarehouseId?: string
	@IsOptional() @IsEnum(['IN', 'OUT', 'TRANSFER']) type?: 'IN' | 'OUT' | 'TRANSFER'
	@IsOptional() @IsEnum(['PENDING', 'COMPLETED', 'CANCELED']) status?: 'PENDING' | 'COMPLETED' | 'CANCELED'
}