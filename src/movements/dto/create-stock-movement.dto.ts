import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class CreateStockMovementDto {
	@IsUUID()
	productId: string

	@IsNumber()
	@Min(1)
	quantity: number

	@IsEnum(['IN', 'OUT', 'TRANSFER'])
	type: 'IN' | 'OUT' | 'TRANSFER'

	@IsOptional()
	@IsUUID()
	originWarehouseId?: string

	@IsOptional()
	@IsUUID()
	destinationWarehouseId?: string

	@IsEnum(['PENDING', 'COMPLETED', 'CANCELED'])
	status: 'PENDING' | 'COMPLETED' | 'CANCELED'

	@IsOptional()
	@IsString()
	notes?: string
}