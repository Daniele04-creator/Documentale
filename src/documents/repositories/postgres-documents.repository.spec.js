import { PostgresDocumentsRepository } from './postgres-documents.repository';
import { DOCUMENT_STATUSES } from '../models/document.constants';

describe('PostgresDocumentsRepository', () => {
  it('builds a safe PATCH update query for title, status, and metadata', async () => {
    const row = {
      id: '682ce33b-9f23-49a3-a995-d8f5dac95ec6',
      title: 'Updated project plan',
      description: 'Initial project document',
      origin: 'manual',
      status: DOCUMENT_STATUSES.IN_REVIEW,
      context: {
        projectId: 'project-001',
      },
      metadata: {
        category: 'planning',
        reviewRequired: true,
      },
      file_info: null,
      version: 1,
      created_at: new Date('2026-04-28T08:00:00.000Z'),
      updated_at: new Date('2026-04-28T09:00:00.000Z'),
      archived_at: null,
    };
    const databaseService = {
      query: jest.fn().mockResolvedValue({
        rows: [row],
      }),
    };
    const repository = new PostgresDocumentsRepository(databaseService);

    const document = await repository.update(row.id, {
      title: 'Updated project plan',
      status: DOCUMENT_STATUSES.IN_REVIEW,
      metadata: {
        category: 'planning',
        reviewRequired: true,
      },
      updatedAt: '2026-04-28T09:00:00.000Z',
    });

    const [sql, values] = databaseService.query.mock.calls[0];

    expect(sql).toContain('title = $1');
    expect(sql).toContain('status = $2');
    expect(sql).toContain('metadata = $3::jsonb');
    expect(sql).toContain('updated_at = $4');
    expect(sql).toContain('WHERE id = $5');
    expect(values).toEqual([
      'Updated project plan',
      DOCUMENT_STATUSES.IN_REVIEW,
      JSON.stringify({
        category: 'planning',
        reviewRequired: true,
      }),
      '2026-04-28T09:00:00.000Z',
      row.id,
    ]);
    expect(document.metadata).toEqual({
      category: 'planning',
      reviewRequired: true,
    });
  });

  it('maps fileInfo to the file_info JSONB column', async () => {
    const row = {
      id: '682ce33b-9f23-49a3-a995-d8f5dac95ec6',
      title: 'Project plan',
      description: null,
      origin: 'manual',
      status: DOCUMENT_STATUSES.DRAFT,
      context: {
        projectId: 'project-001',
      },
      metadata: {},
      file_info: {
        fileName: 'project-plan.pdf',
      },
      version: 1,
      created_at: new Date('2026-04-28T08:00:00.000Z'),
      updated_at: new Date('2026-04-28T09:00:00.000Z'),
      archived_at: null,
    };
    const databaseService = {
      query: jest.fn().mockResolvedValue({
        rows: [row],
      }),
    };
    const repository = new PostgresDocumentsRepository(databaseService);

    await repository.update(row.id, {
      fileInfo: {
        fileName: 'project-plan.pdf',
      },
      updatedAt: '2026-04-28T09:00:00.000Z',
    });

    const [sql, values] = databaseService.query.mock.calls[0];

    expect(sql).toContain('file_info = $1::jsonb');
    expect(values[0]).toBe(JSON.stringify({ fileName: 'project-plan.pdf' }));
  });
});
