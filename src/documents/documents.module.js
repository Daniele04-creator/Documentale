import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { PostgresDocumentsRepository } from './repositories/postgres-documents.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, PostgresDocumentsRepository],
})
export class DocumentsModule {}
