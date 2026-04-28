import { BadRequestException } from '@nestjs/common';
import {
  DOCUMENT_ORIGIN_VALUES,
  DOCUMENT_ORIGINS,
  DOCUMENT_STATUS_VALUES,
  DOCUMENT_STATUSES,
} from '../models/document.constants';

const CONTEXT_FIELDS = [
  'projectId',
  'phaseId',
  'substepId',
  'wbsElementId',
  'taskId',
];

const FILE_INFO_FIELDS = ['fileName', 'mimeType', 'sizeBytes', 'checksum'];

export function validateCreateDocumentPayload(body) {
  assertPlainObject(body, 'Request body');
  rejectUnknownFields(body, [
    'title',
    'description',
    'origin',
    'status',
    'context',
    'metadata',
    'fileInfo',
  ]);

  return {
    title: requiredString(body.title, 'title'),
    description: optionalString(body.description, 'description'),
    origin: optionalEnum(
      body.origin,
      DOCUMENT_ORIGIN_VALUES,
      'origin',
      DOCUMENT_ORIGINS.MANUAL,
    ),
    status: optionalEnum(
      body.status,
      DOCUMENT_STATUS_VALUES,
      'status',
      DOCUMENT_STATUSES.DRAFT,
    ),
    context: validateContext(body.context),
    metadata: validateMetadata(body.metadata),
    fileInfo: validateFileInfo(body.fileInfo),
  };
}

export function validateUpdateDocumentPayload(body) {
  assertPlainObject(body, 'Request body');
  rejectUnknownFields(body, [
    'title',
    'description',
    'status',
    'context',
    'metadata',
    'fileInfo',
  ]);

  if (Object.keys(body).length === 0) {
    throw new BadRequestException('Request body must contain at least one field');
  }

  const payload = {};

  if (body.title !== undefined) {
    payload.title = requiredString(body.title, 'title');
  }

  if (body.description !== undefined) {
    payload.description = optionalString(body.description, 'description');
  }

  if (body.status !== undefined) {
    payload.status = requiredEnum(body.status, DOCUMENT_STATUS_VALUES, 'status');
  }

  if (body.context !== undefined) {
    payload.context = validateContext(body.context);
  }

  if (body.metadata !== undefined) {
    payload.metadata = validateMetadata(body.metadata);
  }

  if (body.fileInfo !== undefined) {
    payload.fileInfo = validateFileInfo(body.fileInfo);
  }

  return payload;
}

export function validateListDocumentsQuery(query) {
  assertPlainObject(query, 'Query string');
  rejectUnknownFields(query, [
    'page',
    'limit',
    'search',
    'projectId',
    'phaseId',
    'substepId',
    'wbsElementId',
    'taskId',
    'origin',
    'status',
  ]);

  return {
    page: optionalPositiveInteger(query.page, 'page', 1),
    limit: optionalPositiveInteger(query.limit, 'limit', 10, 100),
    search: optionalQueryString(query.search, 'search', true),
    projectId: optionalQueryString(query.projectId, 'projectId'),
    phaseId: optionalQueryString(query.phaseId, 'phaseId'),
    substepId: optionalQueryString(query.substepId, 'substepId'),
    wbsElementId: optionalQueryString(query.wbsElementId, 'wbsElementId'),
    taskId: optionalQueryString(query.taskId, 'taskId'),
    origin:
      query.origin === undefined
        ? undefined
        : requiredEnum(query.origin, DOCUMENT_ORIGIN_VALUES, 'origin'),
    status:
      query.status === undefined
        ? undefined
        : requiredEnum(query.status, DOCUMENT_STATUS_VALUES, 'status'),
  };
}

function validateContext(context) {
  assertPlainObject(context, 'context');
  rejectUnknownFields(context, CONTEXT_FIELDS, 'context');

  return {
    projectId: requiredString(context.projectId, 'context.projectId'),
    phaseId: optionalNonEmptyString(context.phaseId, 'context.phaseId'),
    substepId: optionalNonEmptyString(context.substepId, 'context.substepId'),
    wbsElementId: optionalNonEmptyString(
      context.wbsElementId,
      'context.wbsElementId',
    ),
    taskId: optionalNonEmptyString(context.taskId, 'context.taskId'),
  };
}

function validateMetadata(metadata) {
  if (metadata === undefined) {
    return {};
  }

  assertPlainObject(metadata, 'metadata');
  return metadata;
}

function validateFileInfo(fileInfo) {
  if (fileInfo === undefined) {
    return undefined;
  }

  assertPlainObject(fileInfo, 'fileInfo');
  rejectUnknownFields(fileInfo, FILE_INFO_FIELDS, 'fileInfo');

  const payload = {};

  if (fileInfo.fileName !== undefined) {
    payload.fileName = optionalNonEmptyString(fileInfo.fileName, 'fileInfo.fileName');
  }

  if (fileInfo.mimeType !== undefined) {
    payload.mimeType = optionalNonEmptyString(fileInfo.mimeType, 'fileInfo.mimeType');
  }

  if (fileInfo.sizeBytes !== undefined) {
    if (
      typeof fileInfo.sizeBytes !== 'number' ||
      !Number.isFinite(fileInfo.sizeBytes) ||
      fileInfo.sizeBytes < 0
    ) {
      throw new BadRequestException(
        'fileInfo.sizeBytes must be a non-negative number',
      );
    }

    payload.sizeBytes = fileInfo.sizeBytes;
  }

  if (fileInfo.checksum !== undefined) {
    payload.checksum = optionalNonEmptyString(fileInfo.checksum, 'fileInfo.checksum');
  }

  return payload;
}

function requiredString(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new BadRequestException(`${field} must be a non-empty string`);
  }

  return value.trim();
}

function optionalString(value, field) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new BadRequestException(`${field} must be a string`);
  }

  return value;
}

function optionalNonEmptyString(value, field) {
  if (value === undefined) {
    return undefined;
  }

  return requiredString(value, field);
}

function optionalQueryString(value, field, allowEmpty = false) {
  if (value === undefined) {
    return undefined;
  }

  if (Array.isArray(value) || typeof value !== 'string') {
    throw new BadRequestException(`${field} must be a string`);
  }

  const trimmedValue = value.trim();

  if (!allowEmpty && trimmedValue === '') {
    throw new BadRequestException(`${field} must be a non-empty string`);
  }

  return trimmedValue === '' ? undefined : trimmedValue;
}

function requiredEnum(value, allowedValues, field) {
  if (Array.isArray(value) || typeof value !== 'string') {
    throw new BadRequestException(`${field} must be a string`);
  }

  if (!allowedValues.includes(value)) {
    throw new BadRequestException(
      `${field} must be one of: ${allowedValues.join(', ')}`,
    );
  }

  return value;
}

function optionalEnum(value, allowedValues, field, defaultValue) {
  if (value === undefined) {
    return defaultValue;
  }

  return requiredEnum(value, allowedValues, field);
}

function optionalPositiveInteger(value, field, defaultValue, maxValue) {
  if (value === undefined) {
    return defaultValue;
  }

  if (Array.isArray(value)) {
    throw new BadRequestException(`${field} must be a positive integer`);
  }

  const numericValue = typeof value === 'number' ? value : Number(value);

  if (!Number.isInteger(numericValue) || numericValue < 1) {
    throw new BadRequestException(`${field} must be a positive integer`);
  }

  if (maxValue !== undefined && numericValue > maxValue) {
    throw new BadRequestException(`${field} must be less than or equal to ${maxValue}`);
  }

  return numericValue;
}

function assertPlainObject(value, label) {
  if (!isPlainObject(value)) {
    throw new BadRequestException(`${label} must be an object`);
  }
}

function rejectUnknownFields(value, allowedFields, label = 'Request body') {
  for (const field of Object.keys(value)) {
    if (!allowedFields.includes(field)) {
      throw new BadRequestException(`${label} has unknown field: ${field}`);
    }
  }
}

function isPlainObject(value) {
  const prototype = value === null ? undefined : Object.getPrototypeOf(value);

  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    (prototype === Object.prototype || prototype === null)
  );
}
