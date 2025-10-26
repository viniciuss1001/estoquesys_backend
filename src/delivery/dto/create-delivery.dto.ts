import { IsISO8601, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateDeliveryDto {
	@IsNumber()
	quantity: string

	@IsISO8601()
	expectedAt: string

	@IsString()
	productId: string

	@IsString()
	supplierId: string

	@IsString()
	warehouseId: string

	@IsOptional()
	@IsString()
	supplierInvoiceId?: string
}