export enum DocumentOrigin {
  Manual = 'manual',
  Generated = 'generated',
}

export enum DocumentStatus {
  Draft = 'draft',
  InReview = 'in_review',
  Approved = 'approved',
  Archived = 'archived',
}

export interface DocumentContext {
  projectId: string;
  phaseId?: string;
  substepId?: string;
  wbsElementId?: string;
  taskId?: string;
}

export interface DocumentFileInfo {
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  checksum?: string;
}

export interface DocumentModel {
  id: string;
  title: string;
  description?: string;
  origin: DocumentOrigin;
  status: DocumentStatus;
  context: DocumentContext;
  metadata: Record<string, unknown>;
  fileInfo?: DocumentFileInfo;
  version: number;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}
