import 'dotenv/config';
import { Injectable } from '@nestjs/common';
import pg from 'pg';

const { Pool } = pg;

@Injectable()
export class DatabaseService {
  constructor() {
    this.pool = new Pool({
      host: process.env.DATABASE_HOST || 'localhost',
      port: Number(process.env.DATABASE_PORT || 5432),
      user: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'documentale',
      ssl: parseDatabaseSsl(process.env.DATABASE_SSL),
    });
  }

  query(text, params) {
    return this.pool.query(text, params);
  }

  async onApplicationShutdown() {
    await this.pool.end();
  }
}

function parseDatabaseSsl(value) {
  if (value === 'true') {
    return { rejectUnauthorized: false };
  }

  return false;
}
