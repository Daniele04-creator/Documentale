import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { GeneratedDocumentIntakeDto } from './dto/generated-document-intake.dto';
import { ListDocumentsQueryDto } from './dto/list-documents-query.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  async createDocument(@Body() dto: CreateDocumentDto) {
    return {
      data: await this.documentsService.createDocument(dto),
    };
  }

  @Post('generated-intake')
  async intakeGeneratedDocument(@Body() dto: GeneratedDocumentIntakeDto) {
    return {
      data: await this.documentsService.intakeGeneratedDocument(dto),
    };
  }

  @Get()
  async listDocuments(@Query() query: ListDocumentsQueryDto) {
    return this.documentsService.listDocuments(query);
  }

  @Get(':id')
  async getDocumentById(@Param('id') id: string) {
    return {
      data: await this.documentsService.getDocumentById(id),
    };
  }

  @Patch(':id')
  async updateDocument(@Param('id') id: string, @Body() dto: UpdateDocumentDto) {
    return {
      data: await this.documentsService.updateDocument(id, dto),
    };
  }

  @Delete(':id')
  async archiveDocument(@Param('id') id: string) {
    return {
      data: await this.documentsService.archiveDocument(id),
    };
  }
}
