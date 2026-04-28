# AGENTS.md - Template Codex per Management as Code

## Contesto
Questo repository riguarda Management as Code, piattaforma SaaS di Project Management in evoluzione da POC/MVP verso prodotto.

Daniele è tirocinante L-31 e lavora principalmente sul modulo documentale, sui mockup Figma della home documentale e su eventuale sviluppo su codebase esistente.

## Stack aggiornato
- Backend: Node.js + NestJS.
- Frontend target: React + Next.js.
- Frontend legacy/esistente: Vue.
- Database: PostgreSQL, possibile uso JSONB.
- Linguaggio backend indicato: JavaScript, salvo evidenza diversa nel repository.

## Prima di lavorare
- Analizza la struttura del repository.
- Individua pattern, naming, cartelle, comandi e convenzioni esistenti.
- Non modificare file senza prima aver capito il punto corretto di intervento.
- Se il task è ambiguo, dichiara assunzioni e proponi piano.

## Regole operative
- Non creare una nuova architettura parallela.
- Non fare refactor massivi non richiesti.
- Non aggiungere nuove dipendenze senza motivazione.
- Non modificare schema database/migrazioni senza spiegare impatti.
- Segui best practice NestJS lato backend.
- Segui best practice React/Next.js lato frontend.
- Tratta Vue come codice legacy/esistente da analizzare prima di migrare.
- Mantieni codice semplice, leggibile, sicuro, testabile e manutenibile.
- Valida input e gestisci errori.
- Non loggare dati sensibili.
- Considera performance ragionevoli: query, paginazione, I/O, memoria, caching solo se giustificato.

## Modulo documentale
Il modulo documentale gestisce documenti collegati al contesto progettuale.
Non implementare generazione/stampa da template: quella è area separata del collega.
Puoi considerare solo l’integrazione minima: documenti generati possono entrare nel repository documentale come nuovo documento o nuova versione.

## Documentazione
La documentazione formale non è priorità iniziale.
Aggiorna solo documentazione minima quando cambia comportamento, API, struttura dati o requisito importante.
La documentazione finale sarà rifinita dopo il codice.

## Qualità
Alla fine di ogni task riporta:
- file modificati;
- motivazione;
- test/lint/build eseguiti;
- eventuali comandi falliti;
- rischi residui;
- verifiche manuali consigliate.

## Comandi progetto
Completare dopo analisi repository:

```bash
# install
[DA DEFINIRE]

# run backend
[DA DEFINIRE]

# run frontend
[DA DEFINIRE]

# test
[DA DEFINIRE]

# lint
[DA DEFINIRE]

# build
[DA DEFINIRE]
```
