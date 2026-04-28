import {
  BadRequestException,
  Dependencies,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import fs from 'fs/promises';
import path from 'path';
import { DOCUMENT_STATUSES } from './models/document.constants';
import { PostgresDocumentsRepository } from './repositories/postgres-documents.repository';
import { validateDocumentId } from './validators/document.validators';

const STORAGE_ROOT = path.resolve(process.cwd(), 'storage', 'documents');

@Injectable()
@Dependencies(PostgresDocumentsRepository)
export class DocumentsService {
  constructor(documentsRepository) {
    this.documentsRepository = documentsRepository;
  }

  async listDocuments(query) {
    return this.documentsRepository.findAll(query);
  }

  async getDocumentById(id) {
    validateDocumentId(id);

    const document = await this.documentsRepository.findById(id);

    if (!document) {
      throw new NotFoundException(`Document ${id} not found`);
    }

    return document;
  }

  async getDocumentFile(id) {
    const document = await this.getDocumentById(id);
    const fileInfo = document.fileInfo || {};

    if (!fileInfo.storagePath) {
      throw new NotFoundException(`Document ${id} does not have a file path`);
    }

    const absolutePath = resolveStoragePath(fileInfo.storagePath);
    const fileExists = await isExistingFile(absolutePath);

    if (!fileExists) {
      throw new NotFoundException(`Document file not found for ${id}`);
    }

    return {
      absolutePath,
      fileName: fileInfo.fileName || path.basename(absolutePath),
      mimeType: fileInfo.mimeType || 'application/octet-stream',
    };
  }

  async updateDocument(id, payload) {
    await this.getDocumentById(id);

    const updatedDocument = await this.documentsRepository.update(id, {
      ...this.buildUpdateChanges(payload),
      incrementVersion: true,
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
      if (payload.fileInfo.storagePath !== undefined) {
        resolveStoragePath(payload.fileInfo.storagePath);
      }

      changes.fileInfo = payload.fileInfo;
    }

    return changes;
  }
}

function resolveStoragePath(storagePath) {
  const absolutePath = path.resolve(process.cwd(), storagePath);

  if (!isInsideStorageRoot(absolutePath)) {
    throw new BadRequestException(
      'fileInfo.storagePath must be inside storage/documents',
    );
  }

  return absolutePath;
}

function isInsideStorageRoot(absolutePath) {
  const relativePath = path.relative(STORAGE_ROOT, absolutePath);

  return (
    relativePath === '' ||
    (!relativePath.startsWith('..') && !path.isAbsolute(relativePath))
  );
}

async function isExistingFile(absolutePath) {
  try {
    const fileStats = await fs.stat(absolutePath);
    return fileStats.isFile();
  } catch {
    return false;
  }
}
