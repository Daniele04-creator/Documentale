# Management as Code Documents API

Small JavaScript NestJS prototype for the document management module.

The goal is to test the backend API with Postman before building any frontend.

## Stack

- Node.js
- NestJS
- JavaScript
- Babel for decorators
- Jest
- PostgreSQL
- JSONB for flexible document data

## Implemented APIs

Base URL:

```text
http://localhost:3000/api/v1
```

Endpoints:

```text
GET    /health
POST   /documents
GET    /documents
GET    /documents/:id
PATCH  /documents/:id
DELETE /documents/:id
```

## Not implemented

- Frontend
- Authentication or authorization
- ORM or migrations
- File upload or download
- File storage
- Document template generation
- Generated document integration
- Full document version history
- Swagger
- Docker

## Install

```bash
npm install
```

## PostgreSQL setup

Create the database manually:

```sql
CREATE DATABASE documentale;
```

Copy the example environment file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Update `.env` if your PostgreSQL user, password, host, port, or database name are different.

Run the schema setup:

```bash
npm run db:schema
```

The documents table stores `context`, `metadata`, and `fileInfo` as JSONB fields. This is still a prototype, so there is no ORM or migration framework yet.

## Run

```bash
npm run start:dev
```

For a normal run:

```bash
npm run start
```

## Build

```bash
npm run build
```

## Test

```bash
npm test
```

## Postman

Import this collection:

```text
postman/management-as-code-documents-api.postman_collection.json
```

It uses:

```text
baseUrl = http://localhost:3000/api/v1
```

Run `Create manual document` before requests that use `documentId`.

## Manual testing

Use the Postman collection for API testing. Data is now persisted in PostgreSQL, so documents remain available after an API restart.

## Data storage

Data is stored in PostgreSQL. JSONB is used for `context`, `metadata`, and `fileInfo`.
