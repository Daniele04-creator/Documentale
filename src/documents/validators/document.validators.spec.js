import { BadRequestException } from '@nestjs/common';
import { validateUpdateDocumentPayload } from './document.validators';
import { DOCUMENT_STATUSES } from '../models/document.constants';

describe('document validators', () => {
  it('validates a PATCH payload with title, status, and metadata', () => {
    const payload = validateUpdateDocumentPayload({
      title: 'Updated project plan',
      status: DOCUMENT_STATUSES.IN_REVIEW,
      metadata: {
        category: 'planning',
        reviewRequired: true,
      },
    });

    expect(payload).toEqual({
      title: 'Updated project plan',
      status: DOCUMENT_STATUSES.IN_REVIEW,
      metadata: {
        category: 'planning',
        reviewRequired: true,
      },
    });
  });

  it('rejects unknown PATCH fields', () => {
    expect(() =>
      validateUpdateDocumentPayload({
        origin: 'generated',
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects an invalid PATCH status', () => {
    expect(() =>
      validateUpdateDocumentPayload({
        status: 'waiting_for_magic',
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects a PATCH title longer than 200 characters', () => {
    expect(() =>
      validateUpdateDocumentPayload({
        title: 'a'.repeat(201),
      }),
    ).toThrow(BadRequestException);
  });
});
