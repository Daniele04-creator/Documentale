import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { DocumentOrigin, DocumentStatus } from '../models/document.model';
import { DocumentContextDto, DocumentFileInfoDto } from './create-document.dto';

export class UpdateDocumentDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(DocumentOrigin)
  origin?: DocumentOrigin;

  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

  @IsOptional()
  @ValidateNested()
  @Type(() => DocumentContextDto)
  context?: DocumentContextDto;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @ValidateNested()
  @Type(() => DocumentFileInfoDto)
  fileInfo?: DocumentFileInfoDto;
}
