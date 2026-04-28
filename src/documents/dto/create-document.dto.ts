import { Type } from 'class-transformer';
import {
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { DocumentOrigin, DocumentStatus } from '../models/document.model';

export class DocumentContextDto {
  @IsString()
  @IsNotEmpty()
  projectId: string;

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
}

export class DocumentFileInfoDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  fileName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  mimeType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sizeBytes?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  checksum?: string;
}

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(DocumentOrigin)
  origin?: DocumentOrigin;

  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

  @IsDefined()
  @ValidateNested()
  @Type(() => DocumentContextDto)
  context: DocumentContextDto;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @ValidateNested()
  @Type(() => DocumentFileInfoDto)
  fileInfo?: DocumentFileInfoDto;
}
