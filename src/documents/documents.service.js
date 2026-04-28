import { Dependencies, Injectable, NotFoundException } from '@nestjs/common';
import {
  DOCUMENT_ORIGINS,
  DOCUMENT_STATUSES,
} from './models/document.constants';
import { InMemoryDocumentsRepository } from './repositories/in-memory-documents.repository';

@Injectable()
@Dependencies(InMemoryDocumentsRepository)
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
    const page = query.page || 1;
    const limit = query.limit || 10;
    const search = query.search ? query.search.trim().toLowerCase() : undefined;

    let documents = await this.documentsRepository.findAll();

    documents = documents.filter((document) => {
      if (search) {
        const searchableText = `${document.title} ${document.description || ''}`
          .toLowerCase()
          .trim();

        if (!searchableText.includes(search)) {
          return false;
        }
      }

      if (query.projectId && document.context.projectId !== query.projectId) {
        return false;
      }

      if (query.phaseId && document.context.phaseId !== query.phaseId) {
        return false;
      }

      if (query.substepId && document.context.substepId !== query.substepId) {
        return false;
      }

      if (
        query.wbsElementId &&
        document.context.wbsElementId !== query.wbsElementId
      ) {
        return false;
      }

      if (query.taskId && document.context.taskId !== query.taskId) {
        return false;
      }

      if (query.origin && document.origin !== query.origin) {
        return false;
      }

      if (query.status && document.status !== query.status) {
        return false;
      }

      return true;
    });

    documents.sort((first, second) =>
      second.updatedAt.localeCompare(first.updatedAt),
    );

    const total = documents.length;
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;

    return {
      data: documents.slice(startIndex, startIndex + limit),
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
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
