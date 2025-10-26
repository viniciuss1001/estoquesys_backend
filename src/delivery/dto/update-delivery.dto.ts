import { IsOptional, IsNumber, IsISO8601, IsString } from 'class-validator';

export class UpdateDeliveryDto {
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsISO8601()
  expectedAt?: string;

  @IsOptional()
  @IsString()
  status?: 'PENDING' | 'COMPLETED' | 'CANCELED' | 'LATE';

  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  supplierId?: string;

  @IsOptional()
  @IsString()
  warehouseId?: string;

  @IsOptional()
  @IsString()
  supplierInvoiceId?: string;
}
