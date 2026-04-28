import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { DOCUMENTS_REPOSITORY } from './repositories/documents.repository';
import { InMemoryDocumentsRepository } from './repositories/in-memory-documents.repository';

@Module({
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    {
      provide: DOCUMENTS_REPOSITORY,
      useClass: InMemoryDocumentsRepository,
    },
  ],
})
export class DocumentsModule {}
