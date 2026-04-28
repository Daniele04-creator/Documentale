import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { DocumentContextDto, DocumentFileInfoDto } from './create-document.dto';

export class GeneratedDocumentIntakeDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  targetDocumentId?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  externalReference: string;

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
