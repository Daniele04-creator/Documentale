# Management as Code Documents API

JavaScript NestJS prototype for the document management API.

## Stack

- Node.js
- NestJS
- JavaScript
- PostgreSQL
- JSONB
- pg

## Implemented

- Health check
- Create document
- List documents
- Get document by id
- Update document
- Archive document

## Not implemented

- Frontend
- Authentication or authorization
- Upload or download
- Document generation
- ORM
- Swagger

## Setup

Copy the environment example:

```powershell
Copy-Item .env.example .env
```

Create the PostgreSQL database:

```sql
CREATE DATABASE documentale;
```

Install dependencies:

```powershell
npm install
```

Create the table and indexes:

```powershell
npm run db:schema
```

If you already have an older prototype database with the `origin` column, either recreate the database or run:

```sql
ALTER TABLE documents DROP COLUMN IF EXISTS origin;
DROP INDEX IF EXISTS idx_documents_origin;
```

If you already have a prototype database where `updated_at` is required on creation, run:

```sql
ALTER TABLE documents ALTER COLUMN updated_at DROP NOT NULL;
UPDATE documents SET updated_at = NULL WHERE updated_at = created_at;
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

1. Create the sample documents.
2. List all documents.
3. Try the search and JSONB filters.
4. Get a document by id.
5. Update a document and check that `version` increases.
6. Archive a document.

Data is persisted in PostgreSQL. `context`, `metadata`, and `fileInfo` are stored as JSONB.

`createdAt` is set when the document is created. `updatedAt` is `null` until the first real update. `version` starts at 1 and increments on PATCH updates.

## Search and JSONB filters

`search` filters `title` and `description`.

`projectId`, `phaseId`, `substepId`, `wbsElementId`, and `taskId` are read from the `context` JSONB field.

`metadata` and `fileInfo` are stored as JSONB but are not currently used for filtering. `status` is a normal database column.
