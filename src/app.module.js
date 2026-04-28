import { Module } from '@nestjs/common';
import { DocumentsModule } from './documents/documents.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [HealthModule, DocumentsModule],
})
export class AppModule {}
