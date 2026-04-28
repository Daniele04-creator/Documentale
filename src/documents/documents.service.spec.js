import { NotFoundException } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import {
  DOCUMENT_ORIGINS,
  DOCUMENT_STATUSES,
} from './models/document.constants';

describe('DocumentsService', () => {
  let repository;
  let service;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    };
    service = new DocumentsService(repository);
  });

  it('creates a manual document with defaults', async () => {
    const createdDocument = {
      id: 'document-001',
      title: 'Project plan',
      origin: DOCUMENT_ORIGINS.MANUAL,
      status: DOCUMENT_STATUSES.DRAFT,
      context: {
        projectId: 'project-001',
      },
      metadata: {},
      version: 1,
    };
    repository.create.mockResolvedValue(createdDocument);

    const document = await service.createDocument({
      title: 'Project plan',
      context: {
        projectId: 'project-001',
      },
    });

    expect(repository.create).toHaveBeenCalledWith({
      title: 'Project plan',
      description: undefined,
      origin: DOCUMENT_ORIGINS.MANUAL,
      status: DOCUMENT_STATUSES.DRAFT,
      context: {
        projectId: 'project-001',
      },
      metadata: {},
      fileInfo: undefined,
      version: 1,
    });
    expect(document).toEqual(createdDocument);
  });

  it('passes list filters to the repository', async () => {
    const query = {
      page: 1,
      limit: 10,
      projectId: 'project-001',
      status: DOCUMENT_STATUSES.DRAFT,
      search: 'plan',
    };
    const listResult = {
      data: [
        {
          id: 'document-001',
          title: 'Project plan',
        },
      ],
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    };
    repository.findAll.mockResolvedValue(listResult);

    const result = await service.listDocuments(query);

    expect(repository.findAll).toHaveBeenCalledWith(query);
    expect(result).toEqual(listResult);
  });

  it('throws NotFoundException when a document does not exist', async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(service.getDocumentById('missing-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws NotFoundException when updating a missing document', async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(
      service.updateDocument('missing-id', {
        title: 'Updated project plan',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates a document without incrementing version', async () => {
    const existingDocument = {
      id: 'document-001',
      title: 'Project plan',
      origin: DOCUMENT_ORIGINS.MANUAL,
      version: 1,
    };
    const updatedDocument = {
      ...existingDocument,
      title: 'Updated project plan',
      status: DOCUMENT_STATUSES.IN_REVIEW,
      metadata: {
        reviewRequired: true,
      },
    };

    repository.findById.mockResolvedValue(existingDocument);
    repository.update.mockResolvedValue(updatedDocument);

    const updated = await service.updateDocument(existingDocument.id, {
      title: 'Updated project plan',
      status: DOCUMENT_STATUSES.IN_REVIEW,
      metadata: {
        reviewRequired: true,
      },
    });

    expect(repository.update).toHaveBeenCalledWith(
      existingDocument.id,
      expect.objectContaining({
        title: 'Updated project plan',
        status: DOCUMENT_STATUSES.IN_REVIEW,
        metadata: {
          reviewRequired: true,
        },
        updatedAt: expect.any(String),
      }),
    );
    expect(updated.version).toBe(1);
  });

  it('does not allow PATCH to change origin', async () => {
    const existingDocument = {
      id: 'document-001',
      title: 'Project plan',
      origin: DOCUMENT_ORIGINS.MANUAL,
      version: 1,
    };
    const updatedDocument = {
      ...existingDocument,
      title: 'Updated project plan',
    };

    repository.findById.mockResolvedValue(existingDocument);
    repository.update.mockResolvedValue(updatedDocument);

    await service.updateDocument(existingDocument.id, {
      origin: DOCUMENT_ORIGINS.GENERATED,
      title: 'Updated project plan',
    });

    expect(repository.update).toHaveBeenCalledWith(
      existingDocument.id,
      expect.not.objectContaining({
        origin: DOCUMENT_ORIGINS.GENERATED,
      }),
    );
  });

  it('archives a document logically', async () => {
    const existingDocument = {
      id: 'document-001',
      title: 'Project plan',
      status: DOCUMENT_STATUSES.DRAFT,
    };
    const archivedDocument = {
      ...existingDocument,
      status: DOCUMENT_STATUSES.ARCHIVED,
      archivedAt: new Date().toISOString(),
    };

    repository.findById.mockResolvedValue(existingDocument);
    repository.update.mockResolvedValue(archivedDocument);

    const archived = await service.archiveDocument(existingDocument.id);

    expect(repository.update).toHaveBeenCalledWith(
      existingDocument.id,
      expect.objectContaining({
        status: DOCUMENT_STATUSES.ARCHIVED,
      }),
    );
    expect(archived.status).toBe(DOCUMENT_STATUSES.ARCHIVED);
    expect(archived.archivedAt).toBeDefined();
  });
});
