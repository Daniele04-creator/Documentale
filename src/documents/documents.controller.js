import {
  Bind,
  Body,
  Controller,
  Delete,
  Dependencies,
  Get,
  Param,
  Patch,
  Query,
  Res,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import {
  validateListDocumentsQuery,
  validateUpdateDocumentPayload,
} from './validators/document.validators';

@Controller('documents')
@Dependencies(DocumentsService)
export class DocumentsController {
  constructor(documentsService) {
    this.documentsService = documentsService;
  }

  @Get()
  @Bind(Query())
  async listDocuments(query) {
    return this.documentsService.listDocuments(validateListDocumentsQuery(query));
  }

  @Get(':id/file')
  @Bind(Param('id'), Res())
  async downloadDocumentFile(id, response) {
    const file = await this.documentsService.getDocumentFile(id);

    response.setHeader('Content-Type', file.mimeType);
    return response.download(file.absolutePath, file.fileName);
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
