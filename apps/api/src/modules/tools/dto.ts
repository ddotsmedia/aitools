import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from "class-validator";
import { PricingModel } from "@prisma/client";

export class SubmitToolDto {
  @IsString() name!: string;
  @IsUrl({ require_protocol: true }) websiteUrl!: string;
  @IsOptional() @IsString() tagline?: string;
  @IsOptional() @IsEnum(PricingModel) pricingModel?: PricingModel;
}

export class UpdateToolDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() tagline?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsUrl({ require_protocol: true }) websiteUrl?: string;
  @IsOptional() @IsString() logoUrl?: string;
  @IsOptional() @IsEnum(PricingModel) pricingModel?: PricingModel;
  @IsOptional() @IsBoolean() freeTierReal?: boolean;
  @IsOptional() @IsBoolean() hasApi?: boolean;
  @IsOptional() @IsBoolean() isOpenSource?: boolean;
  @IsOptional() @IsArray() @IsString({ each: true }) platforms?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) languages?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) regions?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) categories?: string[]; // category names
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[]; // tag names
}

export class ListToolsQuery {
  @IsOptional() @IsString() status?: string; // admin filter; default published
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsString() category?: string; // slug
  @IsOptional() @IsString() pricing?: string;
  @IsOptional() @IsBoolean() freeTierReal?: boolean;
  @IsOptional() @IsInt() @Min(1) @Max(100) take?: number;
  @IsOptional() @IsInt() @Min(0) skip?: number;
}
