import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  serviceProviderId: string;

  @IsString()
  @IsNotEmpty()
  serviceTypeId: string;

  @IsString()
  @IsNotEmpty()
  serviceLocationId: string;

  @IsDateString()
  serviceDate: string;

  @IsNumber()
  @IsOptional()
  cost?: number;

  @IsString()
  @IsOptional()
  status: 'PENDING' | 'COMPLETED' | 'CANCELED'

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  attachmentUrl?: string | null;

  @IsString()
  @IsOptional()
  invoiceId?: string | null;
}