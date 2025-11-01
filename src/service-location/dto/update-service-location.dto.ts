import { PartialType } from "@nestjs/mapped-types";
import { CreateServiceLocationDto } from "./create-service-location.dto";

export class UpdateServiceLocationDto extends PartialType(CreateServiceLocationDto) {}