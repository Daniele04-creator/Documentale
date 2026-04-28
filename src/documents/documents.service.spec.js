import { NotFoundException } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import {
  DOCUMENT_ORIGINS,
  DOCUMENT_STATUSES,
} from './models/document.constants';
import { InMemoryDocumentsRepository } from './repositories/in-memory-documents.repository';

describe('DocumentsService', () => {
  let service;

  beforeEach(() => {
    service = new DocumentsService(new InMemoryDocumentsRepository());
  });

  it('creates a manual document with defaults', async () => {
    const document = await service.createDocument({
      title: 'Project plan',
      context: {
        projectId: 'project-001',
      },
    });

    expect(document.id).toBeDefined();
    expect(document.origin).toBe(DOCUMENT_ORIGINS.MANUAL);
    expect(document.status).toBe(DOCUMENT_STATUSES.DRAFT);
    expect(document.metadata).toEqual({});
    expect(document.version).toBe(1);
  });

  it('lists documents with filters', async () => {
    await service.createDocument({
      title: 'Project plan',
      description: 'Initial document',
      origin: DOCUMENT_ORIGINS.MANUAL,
      status: DOCUMENT_STATUSES.DRAFT,
      context: {
        projectId: 'project-001',
        phaseId: 'phase-analysis',
      },
    });
    await service.createDocument({
      title: 'Meeting notes',
      origin: DOCUMENT_ORIGINS.MANUAL,
      status: DOCUMENT_STATUSES.APPROVED,
      context: {
        projectId: 'project-002',
      },
    });

    const result = await service.listDocuments({
      page: 1,
      limit: 10,
      projectId: 'project-001',
      status: DOCUMENT_STATUSES.DRAFT,
      search: 'plan',
    });

    expect(result.meta.total).toBe(1);
    expect(result.data[0].title).toBe('Project plan');
  });

  it('throws NotFoundException when a document does not exist', async () => {
    await expect(service.getDocumentById('missing-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates a document without incrementing version', async () => {
    const document = await service.createDocument({
      title: 'Project plan',
      context: {
        projectId: 'project-001',
      },
    });

    const updated = await service.updateDocument(document.id, {
      title: 'Updated project plan',
      status: DOCUMENT_STATUSES.IN_REVIEW,
      metadata: {
        reviewRequired: true,
      },
    });

    expect(updated.title).toBe('Updated project plan');
    expect(updated.status).toBe(DOCUMENT_STATUSES.IN_REVIEW);
    expect(updated.metadata).toEqual({ reviewRequired: true });
    expect(updated.version).toBe(1);
  });

  it('does not allow PATCH to change origin', async () => {
    const document = await service.createDocument({
      title: 'Project plan',
      context: {
        projectId: 'project-001',
      },
    });

    const updated = await service.updateDocument(document.id, {
      origin: DOCUMENT_ORIGINS.GENERATED,
      title: 'Updated project plan',
    });

    expect(updated.origin).toBe(DOCUMENT_ORIGINS.MANUAL);
  });

  it('archives a document logically', async () => {
    const document = await service.createDocument({
      title: 'Project plan',
      context: {
        projectId: 'project-001',
      },
    });

    const archived = await service.archiveDocument(document.id);

    expect(archived.status).toBe(DOCUMENT_STATUSES.ARCHIVED);
    expect(archived.archivedAt).toBeDefined();
  });

  it('creates a new generated document from intake', async () => {
    const document = await service.intakeGeneratedDocument({
      title: 'Generated progress report',
      description: 'Document created by an external service',
      externalReference: 'generator-run-001',
      context: {
        projectId: 'project-001',
      },
      metadata: {
        generatedBy: 'external-generator',
      },
    });

    expect(document.origin).toBe(DOCUMENT_ORIGINS.GENERATED);
    expect(document.version).toBe(1);
    expect(document.metadata).toEqual({
      generatedBy: 'external-generator',
      externalReference: 'generator-run-001',
    });
  });

  it('updates an existing document from intake and increments version', async () => {
    const document = await service.createDocument({
      title: 'Progress report',
      context: {
        projectId: 'project-001',
      },
      metadata: {
        category: 'report',
      },
    });

    const updated = await service.intakeGeneratedDocument({
      targetDocumentId: document.id,
      title: 'Generated progress report - revision',
      description: 'Simulated new version',
      externalReference: 'generator-run-002',
      context: {
        projectId: 'project-001',
        phaseId: 'phase-execution',
      },
      metadata: {
        revisionReason: 'Updated project data',
      },
    });

    expect(updated.origin).toBe(DOCUMENT_ORIGINS.GENERATED);
    expect(updated.version).toBe(2);
    expect(updated.metadata).toEqual({
      revisionReason: 'Updated project data',
      externalReference: 'generator-run-002',
    });
  });
});
