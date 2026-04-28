import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { cloneDocument } from './documents.repository';

@Injectable()
export class InMemoryDocumentsRepository {
  constructor() {
    this.documents = [];
  }

  async create(document) {
    const now = new Date().toISOString();
    const createdDocument = {
      id: randomUUID(),
      ...cloneDocument(document),
      createdAt: now,
      updatedAt: now,
    };

    this.documents.push(createdDocument);
    return cloneDocument(createdDocument);
  }

  async findAll() {
    return this.documents.map((document) => cloneDocument(document));
  }

  async findById(id) {
    const document = this.documents.find((item) => item.id === id);
    return cloneDocument(document);
  }

  async update(id, changes) {
    const documentIndex = this.documents.findIndex((item) => item.id === id);

    if (documentIndex === -1) {
      return undefined;
    }

    const updatedDocument = {
      ...this.documents[documentIndex],
      ...cloneDocument(changes),
    };
    this.documents[documentIndex] = updatedDocument;

    return cloneDocument(updatedDocument);
  }
}
