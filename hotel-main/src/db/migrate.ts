import fs from 'fs';
import path from 'path';
import { getDb, query } from './index.ts';

export async function runMigrations() {
  console.log('🔄 Running PostgreSQL database migrations for La Gazelle d\'Or Resort & Spa...');
  const db = await getDb();
  console.log(`📡 Using Database Engine: ${db.engine}`);

  const schemaPath = path.resolve(process.cwd(), 'src/db/schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf-8');

  // Execute full schema SQL DDL
  await db.exec(sql);

  // Record migration
  const migrationName = '001_initial_production_schema';
  await query(`
    INSERT INTO migrations_history (name)
    VALUES ($1)
    ON CONFLICT (name) DO NOTHING;
  `, [migrationName]);

  // Verify created tables
  const tables = await query<{ table_name: string }>(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);

  console.log('✅ Migrations completed successfully! Tables verified:');
  tables.rows.forEach((r) => console.log(`   - ${r.table_name}`));
}

if (process.argv[1]?.endsWith('migrate.ts')) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Migration failed:', err);
      process.exit(1);
    });
}
