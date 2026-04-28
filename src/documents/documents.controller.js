import {
  Bind,
  Body,
  Controller,
  Delete,
  Dependencies,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import {
  validateCreateDocumentPayload,
  validateListDocumentsQuery,
  validateUpdateDocumentPayload,
} from './validators/document.validators';

@Controller('documents')
@Dependencies(DocumentsService)
export class DocumentsController {
  constructor(documentsService) {
    this.documentsService = documentsService;
  }

  @Post()
  @Bind(Body())
  async createDocument(body) {
    const payload = validateCreateDocumentPayload(body);

    return {
      data: await this.documentsService.createDocument(payload),
    };
  }

  @Get()
  @Bind(Query())
  async listDocuments(query) {
    return this.documentsService.listDocuments(validateListDocumentsQuery(query));
  }

  @Get(':id')
  @Bind(Param('id'))
  async getDocumentById(id) {
    return {
      data: await this.documentsService.getDocumentById(id),
    };
  }

  @Patch(':id')
  @Bind(Param('id'), Body())
  async updateDocument(id, body) {
    const payload = validateUpdateDocumentPayload(body);

    return {
      data: await this.documentsService.updateDocument(id, payload),
    };
  }

  @Delete(':id')
  @Bind(Param('id'))
  async archiveDocument(id) {
    return {
      data: await this.documentsService.archiveDocument(id),
    };
  }
}
