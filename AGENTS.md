# AGENTS.md

This repository is a JavaScript NestJS backend prototype for the Management as Code document module.

Rules:

- Backend only. Do not add a frontend here.
- PostgreSQL is used for persistence.
- `context`, `metadata`, and `fileInfo` are stored as JSONB.
- Document records are seeded for local testing. Do not add a public create-document API unless asked.
- Physical sample files live under `storage/documents`.
- Write code and repository text in English.
- Keep controllers thin.
- Keep services simple.
- Keep validation simple and easy to read.
- Do not add an ORM, frontend, upload, download, auth, Swagger, Docker, or document generation unless asked.
- After code changes, run `npm run build`.
- Use the Postman collection for manual API checks.
