import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { DocumentOrigin, DocumentStatus } from '../models/document.model';

export class ListDocumentsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  projectId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  phaseId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  substepId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  wbsElementId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  taskId?: string;

  @IsOptional()
  @IsEnum(DocumentOrigin)
  origin?: DocumentOrigin;

  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;
}
