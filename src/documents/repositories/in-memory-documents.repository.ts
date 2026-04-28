import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DocumentModel } from '../models/document.model';
import {
  DocumentUpdateData,
  DocumentsRepository,
  NewDocumentData,
} from './documents.repository';

@Injectable()
export class InMemoryDocumentsRepository implements DocumentsRepository {
  private readonly documents: DocumentModel[] = [];

  async create(document: NewDocumentData): Promise<DocumentModel> {
    const now = new Date().toISOString();
    const createdDocument: DocumentModel = {
      id: randomUUID(),
      ...clone(document),
      createdAt: now,
      updatedAt: now,
    };

    this.documents.push(createdDocument);
    return clone(createdDocument);
  }

  async findAll(): Promise<DocumentModel[]> {
    return this.documents.map((document) => clone(document));
  }

  async findById(id: string): Promise<DocumentModel | undefined> {
    const document = this.documents.find((item) => item.id === id);
    return document ? clone(document) : undefined;
  }

  async update(
    id: string,
    changes: DocumentUpdateData,
  ): Promise<DocumentModel | undefined> {
    const documentIndex = this.documents.findIndex((item) => item.id === id);

    if (documentIndex === -1) {
      return undefined;
    }

    const updatedDocument = {
      ...this.documents[documentIndex],
      ...clone(changes),
    };
    this.documents[documentIndex] = updatedDocument;

    return clone(updatedDocument);
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
