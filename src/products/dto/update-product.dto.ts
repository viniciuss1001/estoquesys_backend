import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  IsEnum,
  IsDateString,
  IsPositive,
} from 'class-validator';
import { UsageStatus } from './create-product.dto';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsUUID()
  category?: string;

  @IsOptional()
  @IsUUID()
  supplier?: string;

  @IsOptional()
  @IsUUID()
  warehouse?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsEnum(UsageStatus)
  usageStatus?: UsageStatus;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsNumber()
  minimumStock?: number;
}
