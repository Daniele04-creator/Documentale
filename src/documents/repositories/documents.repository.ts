import { DocumentModel } from '../models/document.model';

export const DOCUMENTS_REPOSITORY = Symbol('DOCUMENTS_REPOSITORY');

export type NewDocumentData = Omit<
  DocumentModel,
  'id' | 'createdAt' | 'updatedAt' | 'archivedAt'
>;

export type DocumentUpdateData = Partial<
  Omit<DocumentModel, 'id' | 'createdAt'>
>;

export interface DocumentsRepository {
  create(document: NewDocumentData): Promise<DocumentModel>;
  findAll(): Promise<DocumentModel[]>;
  findById(id: string): Promise<DocumentModel | undefined>;
  update(
    id: string,
    changes: DocumentUpdateData,
  ): Promise<DocumentModel | undefined>;
}
