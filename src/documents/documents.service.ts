import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { GeneratedDocumentIntakeDto } from './dto/generated-document-intake.dto';
import { ListDocumentsQueryDto } from './dto/list-documents-query.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import {
  DocumentModel,
  DocumentOrigin,
  DocumentStatus,
} from './models/document.model';
import {
  DOCUMENTS_REPOSITORY,
  DocumentUpdateData,
  DocumentsRepository,
} from './repositories/documents.repository';

export interface PaginatedDocuments {
  data: DocumentModel[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class DocumentsService {
  constructor(
    @Inject(DOCUMENTS_REPOSITORY)
    private readonly documentsRepository: DocumentsRepository,
  ) {}

  async createDocument(dto: CreateDocumentDto): Promise<DocumentModel> {
    return this.documentsRepository.create({
      title: dto.title,
      description: dto.description,
      origin: dto.origin ?? DocumentOrigin.Manual,
      status: dto.status ?? DocumentStatus.Draft,
      context: dto.context,
      metadata: dto.metadata ?? {},
      fileInfo: dto.fileInfo,
      version: 1,
    });
  }

  async listDocuments(query: ListDocumentsQueryDto): Promise<PaginatedDocuments> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim().toLowerCase();

    let documents = await this.documentsRepository.findAll();

    documents = documents.filter((document) => {
      if (search) {
        const searchableText = `${document.title} ${document.description ?? ''}`
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

  async getDocumentById(id: string): Promise<DocumentModel> {
    const document = await this.documentsRepository.findById(id);

    if (!document) {
      throw new NotFoundException(`Document ${id} not found`);
    }

    return document;
  }

  async updateDocument(
    id: string,
    dto: UpdateDocumentDto,
  ): Promise<DocumentModel> {
    await this.getDocumentById(id);

    const changes = this.buildUpdateChanges(dto);
    const updatedDocument = await this.documentsRepository.update(id, {
      ...changes,
      updatedAt: new Date().toISOString(),
    });

    if (!updatedDocument) {
      throw new NotFoundException(`Document ${id} not found`);
    }

    return updatedDocument;
  }

  async archiveDocument(id: string): Promise<DocumentModel> {
    await this.getDocumentById(id);

    const now = new Date().toISOString();
    const archivedDocument = await this.documentsRepository.update(id, {
      status: DocumentStatus.Archived,
      archivedAt: now,
      updatedAt: now,
    });

    if (!archivedDocument) {
      throw new NotFoundException(`Document ${id} not found`);
    }

    return archivedDocument;
  }

  async intakeGeneratedDocument(
    dto: GeneratedDocumentIntakeDto,
  ): Promise<DocumentModel> {
    if (!dto.targetDocumentId) {
      return this.documentsRepository.create({
        title: dto.title,
        description: dto.description,
        origin: DocumentOrigin.Generated,
        status: DocumentStatus.Draft,
        context: dto.context,
        metadata: this.withExternalReference(
          dto.metadata,
          dto.externalReference,
        ),
        fileInfo: dto.fileInfo,
        version: 1,
      });
    }

    const existingDocument = await this.getDocumentById(dto.targetDocumentId);
    const changes: DocumentUpdateData = {
      title: dto.title,
      origin: DocumentOrigin.Generated,
      context: dto.context,
      metadata: this.withExternalReference(
        dto.metadata,
        dto.externalReference,
        existingDocument.metadata,
      ),
      version: existingDocument.version + 1,
      updatedAt: new Date().toISOString(),
    };

    if (dto.description !== undefined) {
      changes.description = dto.description;
    }

    if (dto.fileInfo !== undefined) {
      changes.fileInfo = dto.fileInfo;
    }

    const updatedDocument = await this.documentsRepository.update(
      dto.targetDocumentId,
      changes,
    );

    if (!updatedDocument) {
      throw new NotFoundException(`Document ${dto.targetDocumentId} not found`);
    }

    return updatedDocument;
  }

  private buildUpdateChanges(dto: UpdateDocumentDto): DocumentUpdateData {
    const changes: DocumentUpdateData = {};

    if (dto.title !== undefined) {
      changes.title = dto.title;
    }

    if (dto.description !== undefined) {
      changes.description = dto.description;
    }

    if (dto.origin !== undefined) {
      changes.origin = dto.origin;
    }

    if (dto.status !== undefined) {
      changes.status = dto.status;
    }

    if (dto.context !== undefined) {
      changes.context = dto.context;
    }

    if (dto.metadata !== undefined) {
      changes.metadata = dto.metadata;
    }

    if (dto.fileInfo !== undefined) {
      changes.fileInfo = dto.fileInfo;
    }

    return changes;
  }

  private withExternalReference(
    metadata: Record<string, unknown> | undefined,
    externalReference: string,
    fallbackMetadata: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      ...(metadata ?? fallbackMetadata),
      externalReference,
    };
  }
}
