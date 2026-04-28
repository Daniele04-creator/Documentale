export const DOCUMENT_ORIGINS = Object.freeze({
  MANUAL: 'manual',
  GENERATED: 'generated',
});

export const DOCUMENT_STATUSES = Object.freeze({
  DRAFT: 'draft',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  ARCHIVED: 'archived',
});

export const DOCUMENT_ORIGIN_VALUES = Object.freeze(Object.values(DOCUMENT_ORIGINS));
export const DOCUMENT_STATUS_VALUES = Object.freeze(Object.values(DOCUMENT_STATUSES));
