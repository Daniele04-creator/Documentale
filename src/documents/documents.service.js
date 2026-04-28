import { Dependencies, Injectable, NotFoundException } from '@nestjs/common';
import {
  DOCUMENT_ORIGINS,
  DOCUMENT_STATUSES,
} from './models/document.constants';
import { PostgresDocumentsRepository } from './repositories/postgres-documents.repository';

@Injectable()
@Dependencies(PostgresDocumentsRepository)
export class DocumentsService {
  constructor(documentsRepository) {
    this.documentsRepository = documentsRepository;
  }

  async createDocument(payload) {
    return this.documentsRepository.create({
      title: payload.title,
      description: payload.description,
      origin: payload.origin || DOCUMENT_ORIGINS.MANUAL,
      status: payload.status || DOCUMENT_STATUSES.DRAFT,
      context: payload.context,
      metadata: payload.metadata || {},
      fileInfo: payload.fileInfo,
      version: 1,
    });
  }

  async listDocuments(query) {
    return this.documentsRepository.findAll(query);
  }

  async getDocumentById(id) {
    const document = await this.documentsRepository.findById(id);

    if (!document) {
      throw new NotFoundException(`Document ${id} not found`);
    }

    return document;
  }

  async updateDocument(id, payload) {
    await this.getDocumentById(id);

    const updatedDocument = await this.documentsRepository.update(id, {
      ...this.buildUpdateChanges(payload),
      updatedAt: new Date().toISOString(),
    });

    if (!updatedDocument) {
      throw new NotFoundException(`Document ${id} not found`);
    }

    return updatedDocument;
  }

  async archiveDocument(id) {
    await this.getDocumentById(id);

    const now = new Date().toISOString();
    const archivedDocument = await this.documentsRepository.update(id, {
      status: DOCUMENT_STATUSES.ARCHIVED,
      archivedAt: now,
      updatedAt: now,
    });

    if (!archivedDocument) {
      throw new NotFoundException(`Document ${id} not found`);
    }

    return archivedDocument;
  }

  buildUpdateChanges(payload) {
    const changes = {};

    if (payload.title !== undefined) {
      changes.title = payload.title;
    }

    if (payload.description !== undefined) {
      changes.description = payload.description;
    }

    if (payload.status !== undefined) {
      changes.status = payload.status;
    }

    if (payload.context !== undefined) {
      changes.context = payload.context;
    }

    if (payload.metadata !== undefined) {
      changes.metadata = payload.metadata;
    }

    if (payload.fileInfo !== undefined) {
      changes.fileInfo = payload.fileInfo;
    }

    return changes;
  }
}
