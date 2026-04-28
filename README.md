# Management as Code Documents API

JavaScript NestJS prototype for the document management API.

This module does not generate documents. It reads document records from PostgreSQL and opens local files that already exist under `storage/documents`.

## Stack

- Node.js
- NestJS
- JavaScript
- PostgreSQL
- JSONB
- pg

## Implemented

- Health check
- List existing documents
- Search and filter documents
- Get document metadata by id
- Download the local document file
- Update document metadata, context, fileInfo, and status
- Archive a document record

## Not implemented

- Frontend
- Authentication or authorization
- Upload
- Document generation
- ORM
- Swagger

## Setup

Install dependencies:

```powershell
npm install
```

Copy the environment example:

```powershell
Copy-Item .env.example .env
```

Create the PostgreSQL database:

```sql
CREATE DATABASE documentale;
```

Create the table and indexes:

```powershell
npm run db:schema
```

Insert sample documents for local testing:

```powershell
npm run db:seed
```

Start the API:

```powershell
npm run start:dev
```

## Base URL

```text
http://localhost:3000/api/v1
```

## Manual testing

Use the Postman collection in the `postman` folder.

Recommended order:

1. Run `npm run db:schema`.
2. Run `npm run db:seed`.
3. Start the API.
4. List documents.
5. Get a document by id.
6. Download the document file.
7. Update metadata or status and check that `version` increases.
8. Archive a document.

## Notes

- Documents are persisted in PostgreSQL.
- `context`, `metadata`, and `fileInfo` are stored as JSONB.
- `fileInfo.storagePath` points to a local file under `storage/documents`.
- `GET /documents/:id/file` downloads the physical file.
- `PATCH /documents/:id` updates the database record only. It does not change file content.
- `DELETE /documents/:id` archives the database record only. It does not delete the file.
- `createdAt` is set when the document is inserted.
- `updatedAt` is `null` until the first update.
- `version` starts at 1 and increments on PATCH updates.

## Search and Filters

`search` filters `title` and `description`.

`projectId`, `phaseId`, `substepId`, `wbsElementId`, and `taskId` are read from the `context` JSONB field.

`status` is a normal database column.
