# Management as Code Documents API

Small JavaScript NestJS prototype for the document management module.

The goal is to test the backend API with Postman before building any frontend.

## Stack

- Node.js
- NestJS
- JavaScript
- Babel for decorators
- Jest
- In-memory storage

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
- Database
- PostgreSQL or JSONB
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

## Data storage

Data is stored only in memory. If the server restarts, all documents are lost.
