/**
 * Production PostgreSQL Connection Pool & Abstraction
 * Supports standard remote PostgreSQL via DATABASE_URL or official WASM PostgreSQL (PGlite)
 * with complete transactional support (BEGIN, COMMIT, ROLLBACK, SELECT FOR UPDATE).
 */

import { PGlite } from '@electric-sql/pglite';
import dotenv from 'dotenv';
import path from 'path';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;

interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

export interface DbClient {
  query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>>;
}

let pgPool: pg.Pool | null = null;
let pgliteInstance: PGlite | null = null;
let activeEngine: 'hosted_postgres' | 'pglite_wasm' = 'pglite_wasm';

export async function getDb(): Promise<{
  query: <T = any>(text: string, params?: any[]) => Promise<QueryResult<T>>;
  exec: (sql: string) => Promise<any>;
  transaction: <T = any>(fn: (txClient: DbClient) => Promise<T>) => Promise<T>;
  engine: string;
}> {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (databaseUrl && databaseUrl.length > 5 && !databaseUrl.includes('placeholder')) {
    if (!pgPool) {
      pgPool = new Pool({
        connectionString: databaseUrl,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });

      pgPool.on('error', (err) => {
        console.error('[PostgreSQL Pool Error]', err);
      });

      activeEngine = 'hosted_postgres';
    }

    return {
      engine: 'PostgreSQL (Hosted Instance)',
      query: async <T = any>(text: string, params?: any[]): Promise<QueryResult<T>> => {
        const res = await pgPool!.query(text, params);
        return {
          rows: res.rows,
          rowCount: res.rowCount ?? res.rows.length,
        };
      },
      exec: async (sql: string): Promise<any> => {
        return await pgPool!.query(sql);
      },
      transaction: async <T = any>(fn: (txClient: DbClient) => Promise<T>): Promise<T> => {
        const client = await pgPool!.connect();
        try {
          await client.query('BEGIN');
          const txClient: DbClient = {
            query: async <R = any>(text: string, params?: any[]): Promise<QueryResult<R>> => {
              const res = await client.query(text, params);
              return { rows: res.rows, rowCount: res.rowCount ?? res.rows.length };
            },
          };
          const result = await fn(txClient);
          await client.query('COMMIT');
          return result;
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        } finally {
          client.release();
        }
      },
    };
  }

  // Fallback to official PGlite (Real PostgreSQL WASM with persistent disk storage)
  if (!pgliteInstance) {
    const dataDir = path.resolve(process.cwd(), '.data/postgres');
    const fs = await import('fs');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    } else {
      const pidFile = path.join(dataDir, 'postmaster.pid');
      if (fs.existsSync(pidFile)) {
        try {
          fs.unlinkSync(pidFile);
        } catch (e) {
          // ignore
        }
      }
    }
    try {
      pgliteInstance = new PGlite(dataDir);
      await pgliteInstance.waitReady;
    } catch (initErr) {
      console.warn('⚠️ PGlite recovered from unclean shutdown, resetting data store...', initErr);
      try {
        fs.rmSync(dataDir, { recursive: true, force: true });
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (rmErr) {
        // ignore
      }
      pgliteInstance = new PGlite(dataDir);
      await pgliteInstance.waitReady;
    }
    activeEngine = 'pglite_wasm';
  }

  return {
    engine: 'PostgreSQL (PGlite Official Engine)',
    query: async <T = any>(text: string, params?: any[]): Promise<QueryResult<T>> => {
      const res = await pgliteInstance!.query(text, params);
      return {
        rows: (res.rows || []) as T[],
        rowCount: res.affectedRows ?? res.rows.length,
      };
    },
    exec: async (sql: string): Promise<any> => {
      return await pgliteInstance!.exec(sql);
    },
    transaction: async <T = any>(fn: (txClient: DbClient) => Promise<T>): Promise<T> => {
      return await pgliteInstance!.transaction(async (tx) => {
        const txClient: DbClient = {
          query: async <R = any>(text: string, params?: any[]): Promise<QueryResult<R>> => {
            const res = await tx.query(text, params);
            return {
              rows: (res.rows || []) as R[],
              rowCount: res.affectedRows ?? res.rows.length,
            };
          },
        };
        return await fn(txClient);
      });
    },
  };
}

export async function query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  const db = await getDb();
  return db.query<T>(text, params);
}

export async function transaction<T = any>(fn: (txClient: DbClient) => Promise<T>): Promise<T> {
  const db = await getDb();
  return db.transaction<T>(fn);
}

export function getEngineName(): string {
  return activeEngine === 'hosted_postgres' ? 'Hosted PostgreSQL' : 'PGlite PostgreSQL';
}
