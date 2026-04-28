import { Dependencies, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DatabaseService } from '../../database/database.service';

@Injectable()
@Dependencies(DatabaseService)
export class PostgresDocumentsRepository {
  constructor(databaseService) {
    this.databaseService = databaseService;
  }

  async create(document) {
    const id = randomUUID();
    const now = new Date();

    const result = await this.databaseService.query(
      `
        INSERT INTO documents (
          id,
          title,
          description,
          status,
          context,
          metadata,
          file_info,
          version,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7::jsonb, $8, $9)
        RETURNING *
      `,
      [
        id,
        document.title,
        document.description || null,
        document.status,
        JSON.stringify(document.context || {}),
        JSON.stringify(document.metadata || {}),
        document.fileInfo === undefined ? null : JSON.stringify(document.fileInfo),
        document.version || 1,
        now,
      ],
    );

    return mapDocumentRow(result.rows[0]);
  }

  async findAll(filters) {
    const where = [];
    const params = [];

    addTextSearchFilter(where, params, filters.search);
    addPlainFilter(where, params, 'status', filters.status);
    addContextFilter(where, params, 'projectId', filters.projectId);
    addContextFilter(where, params, 'phaseId', filters.phaseId);
    addContextFilter(where, params, 'substepId', filters.substepId);
    addContextFilter(where, params, 'wbsElementId', filters.wbsElementId);
    addContextFilter(where, params, 'taskId', filters.taskId);

    const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const dataResult = await this.databaseService.query(
      `
        SELECT *
        FROM documents
        ${whereSql}
        ORDER BY COALESCE(updated_at, created_at) DESC
      `,
      params,
    );

    const documents = dataResult.rows.map(mapDocumentRow);

    return {
      data: documents,
      meta: {
        total: documents.length,
      },
    };
  }

  async findById(id) {
    const result = await this.databaseService.query(
      'SELECT * FROM documents WHERE id = $1',
      [id],
    );

    return result.rows[0] ? mapDocumentRow(result.rows[0]) : undefined;
  }

  async update(id, changes) {
    const setClauses = [];
    const values = [];

    addUpdateField(setClauses, values, 'title', changes.title);
    addUpdateField(setClauses, values, 'description', changes.description);
    addUpdateField(setClauses, values, 'status', changes.status);
    addJsonUpdateField(setClauses, values, 'context', changes.context);
    addJsonUpdateField(setClauses, values, 'metadata', changes.metadata);
    addJsonUpdateField(setClauses, values, 'file_info', changes.fileInfo);
    addTimestampUpdateField(setClauses, values, 'archived_at', changes.archivedAt);

    if (setClauses.length === 0) {
      return undefined;
    }

    if (changes.incrementVersion === true) {
      setClauses.push('version = version + 1');
    }

    values.push(changes.updatedAt || new Date().toISOString());
    setClauses.push(`updated_at = $${values.length}`);

    values.push(id);

    const result = await this.databaseService.query(
      `
        UPDATE documents
        SET ${setClauses.join(', ')}
        WHERE id = $${values.length}
        RETURNING *
      `,
      values,
    );

    return result.rows[0] ? mapDocumentRow(result.rows[0]) : undefined;
  }
}

function addTextSearchFilter(where, params, search) {
  if (!search) {
    return;
  }

  params.push(`%${search}%`);
  where.push(`(title ILIKE $${params.length} OR description ILIKE $${params.length})`);
}

function addPlainFilter(where, params, fieldName, value) {
  if (!value) {
    return;
  }

  params.push(value);
  where.push(`${fieldName} = $${params.length}`);
}

function addContextFilter(where, params, contextField, value) {
  if (!value) {
    return;
  }

  params.push(value);
  where.push(`context ->> '${contextField}' = $${params.length}`);
}

function addUpdateField(setParts, params, columnName, value) {
  if (value === undefined) {
    return;
  }

  params.push(value);
  setParts.push(`${columnName} = $${params.length}`);
}

function addJsonUpdateField(setParts, params, columnName, value) {
  if (value === undefined) {
    return;
  }

  params.push(value === null ? null : JSON.stringify(value));
  setParts.push(`${columnName} = $${params.length}::jsonb`);
}

function addTimestampUpdateField(setParts, params, columnName, value) {
  if (value === undefined) {
    return;
  }

  params.push(value);
  setParts.push(`${columnName} = $${params.length}`);
}

function mapDocumentRow(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    status: row.status,
    context: row.context || {},
    metadata: row.metadata || {},
    fileInfo: row.file_info || undefined,
    version: row.version,
    createdAt: toIsoString(row.created_at),
    updatedAt: row.updated_at ? toIsoString(row.updated_at) : null,
    archivedAt: row.archived_at ? toIsoString(row.archived_at) : undefined,
  };
}

function toIsoString(value) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return new Date(value).toISOString();
}
