import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { InMemoryDocumentsRepository } from './repositories/in-memory-documents.repository';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService, InMemoryDocumentsRepository],
})
export class DocumentsModule {}
