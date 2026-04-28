import { NotFoundException } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentOrigin, DocumentStatus } from './models/document.model';
import { InMemoryDocumentsRepository } from './repositories/in-memory-documents.repository';

describe('DocumentsService', () => {
  let service: DocumentsService;

  beforeEach(() => {
    service = new DocumentsService(new InMemoryDocumentsRepository());
  });

  it('creates a manual document with defaults', async () => {
    const document = await service.createDocument({
      title: 'Piano di progetto',
      context: {
        projectId: 'project-001',
      },
    });

    expect(document.id).toBeDefined();
    expect(document.origin).toBe(DocumentOrigin.Manual);
    expect(document.status).toBe(DocumentStatus.Draft);
    expect(document.metadata).toEqual({});
    expect(document.version).toBe(1);
  });

  it('lists documents with filters', async () => {
    await service.createDocument({
      title: 'Piano di progetto',
      description: 'Documento iniziale',
      origin: DocumentOrigin.Manual,
      status: DocumentStatus.Draft,
      context: {
        projectId: 'project-001',
        phaseId: 'phase-analisi',
      },
    });
    await service.createDocument({
      title: 'Verbale riunione',
      origin: DocumentOrigin.Manual,
      status: DocumentStatus.Approved,
      context: {
        projectId: 'project-002',
      },
    });

    const result = await service.listDocuments({
      page: 1,
      limit: 10,
      projectId: 'project-001',
      status: DocumentStatus.Draft,
      search: 'piano',
    });

    expect(result.meta.total).toBe(1);
    expect(result.data[0].title).toBe('Piano di progetto');
  });

  it('throws NotFoundException when a document does not exist', async () => {
    await expect(service.getDocumentById('missing-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates a document without incrementing version', async () => {
    const document = await service.createDocument({
      title: 'Piano di progetto',
      context: {
        projectId: 'project-001',
      },
    });

    const updated = await service.updateDocument(document.id, {
      title: 'Piano di progetto aggiornato',
      status: DocumentStatus.InReview,
      metadata: {
        reviewRequired: true,
      },
    });

    expect(updated.title).toBe('Piano di progetto aggiornato');
    expect(updated.status).toBe(DocumentStatus.InReview);
    expect(updated.metadata).toEqual({ reviewRequired: true });
    expect(updated.version).toBe(1);
  });

  it('archives a document logically', async () => {
    const document = await service.createDocument({
      title: 'Piano di progetto',
      context: {
        projectId: 'project-001',
      },
    });

    const archived = await service.archiveDocument(document.id);

    expect(archived.status).toBe(DocumentStatus.Archived);
    expect(archived.archivedAt).toBeDefined();
  });

  it('creates a new generated document from intake', async () => {
    const document = await service.intakeGeneratedDocument({
      title: 'Report avanzamento generato',
      description: 'Documento generato dal servizio esterno',
      externalReference: 'generator-run-001',
      context: {
        projectId: 'project-001',
      },
      metadata: {
        generatedBy: 'external-generator',
      },
    });

    expect(document.origin).toBe(DocumentOrigin.Generated);
    expect(document.version).toBe(1);
    expect(document.metadata).toEqual({
      generatedBy: 'external-generator',
      externalReference: 'generator-run-001',
    });
  });

  it('updates an existing document from intake and increments version', async () => {
    const document = await service.createDocument({
      title: 'Report avanzamento',
      context: {
        projectId: 'project-001',
      },
      metadata: {
        category: 'report',
      },
    });

    const updated = await service.intakeGeneratedDocument({
      targetDocumentId: document.id,
      title: 'Report avanzamento generato - revisione',
      description: 'Nuova versione simulata',
      externalReference: 'generator-run-002',
      context: {
        projectId: 'project-001',
        phaseId: 'phase-esecuzione',
      },
      metadata: {
        revisionReason: 'Aggiornamento dati progetto',
      },
    });

    expect(updated.origin).toBe(DocumentOrigin.Generated);
    expect(updated.version).toBe(2);
    expect(updated.metadata).toEqual({
      revisionReason: 'Aggiornamento dati progetto',
      externalReference: 'generator-run-002',
    });
  });
});
