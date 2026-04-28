# Management as Code - Documents API Prototype

Backend prototipale NestJS per il modulo documentale di Management as Code.
Serve a provare le API REST da Postman prima di collegare il futuro frontend React/Next.js.

## Scopo

Il prototipo gestisce documenti come metadati applicativi in memoria. Non salva file reali e non persiste dati su database: ogni riavvio svuota lo stato.

## Stack usato

- Node.js
- NestJS
- TypeScript
- class-validator / class-transformer
- Jest per test unitari

Nota: TypeScript e' una scelta tecnica idiomatica per questo prototipo NestJS. Va validata rispetto al repository reale, dove il linguaggio backend definitivo potrebbe essere JavaScript.

## Non implementato

- Frontend
- Autenticazione reale
- ACL o permessi avanzati
- Upload fisico di file
- Download reale
- Salvataggio su filesystem
- Database, PostgreSQL, JSONB, ORM o migrazioni
- Generazione documenti da template
- Motore di stampa
- Kafka o eventi asincroni
- Swagger/OpenAPI
- Versioning documentale complesso

PostgreSQL e un possibile campo JSONB per `metadata` saranno introdotti in una fase successiva. Il versioning dell'endpoint `generated-intake` e' solo una simulazione: incrementa `version` sul documento corrente senza storico.

## Comandi

```bash
npm install
npm run start:dev
npm test
npm run build
```

Il server usa la porta `3000` di default. E' possibile sovrascriverla con `PORT`.

## Base URL

```text
http://localhost:3000/api/v1
```

## Endpoint

| Metodo | Path | Descrizione |
| --- | --- | --- |
| GET | `/health` | Health check |
| POST | `/documents` | Crea documento manuale |
| GET | `/documents` | Lista documenti con filtri e paginazione |
| GET | `/documents/:id` | Dettaglio documento |
| PATCH | `/documents/:id` | Aggiorna documento |
| DELETE | `/documents/:id` | Archivia logicamente documento |
| POST | `/documents/generated-intake` | Simula acquisizione documento generato |

## Ordine consigliato per Postman

1. Health check
2. Create manual document
3. List documents
4. Get document by id
5. Update document
6. Generated intake existing document
7. Archive document
8. Generated intake new document

La collection si trova in:

```text
postman/management-as-code-documents-api.postman_collection.json
```

Usa le variabili:

- `baseUrl = http://localhost:3000/api/v1`
- `documentId`, valorizzata automaticamente dalla richiesta di creazione manuale

## Esempio creazione documento manuale

```json
{
  "title": "Piano di progetto",
  "description": "Documento iniziale del progetto",
  "origin": "manual",
  "status": "draft",
  "context": {
    "projectId": "project-001",
    "phaseId": "phase-analisi",
    "substepId": "substep-requisiti",
    "wbsElementId": "wbs-001"
  },
  "metadata": {
    "category": "planning",
    "owner": "Daniele"
  },
  "fileInfo": {
    "fileName": "piano-progetto.pdf",
    "mimeType": "application/pdf",
    "sizeBytes": 123456
  }
}
```

## Esempio generated intake

```json
{
  "title": "Report avanzamento generato",
  "description": "Documento generato dal servizio esterno",
  "externalReference": "generator-run-001",
  "context": {
    "projectId": "project-001",
    "phaseId": "phase-esecuzione",
    "wbsElementId": "wbs-002"
  },
  "metadata": {
    "generatedBy": "external-generator",
    "templateCode": "REPORT_ADV"
  },
  "fileInfo": {
    "fileName": "report-avanzamento.pdf",
    "mimeType": "application/pdf",
    "sizeBytes": 456789
  }
}
```
