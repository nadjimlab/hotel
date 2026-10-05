import { getDb } from './index.ts';

export async function runRollback() {
  console.log('⚠️  Rolling back PostgreSQL database migrations...');
  const db = await getDb();

  await db.transaction(async (tx) => {
    const dropTablesSql = `
      DROP TABLE IF EXISTS audit_logs CASCADE;
      DROP TABLE IF EXISTS notifications CASCADE;
      DROP TABLE IF EXISTS payments CASCADE;
      DROP TABLE IF EXISTS reservation_services CASCADE;
      DROP TABLE IF EXISTS reservations CASCADE;
      DROP TABLE IF EXISTS offers CASCADE;
      DROP TABLE IF EXISTS services CASCADE;
      DROP TABLE IF EXISTS rates CASCADE;
      DROP TABLE IF EXISTS room_amenities CASCADE;
      DROP TABLE IF EXISTS amenities CASCADE;
      DROP TABLE IF EXISTS room_images CASCADE;
      DROP TABLE IF EXISTS rooms CASCADE;
      DROP TABLE IF EXISTS room_types CASCADE;
      DROP TABLE IF EXISTS guests CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS migrations_history CASCADE;
    `;
    await tx.query(dropTablesSql);
  });

  console.log('✅ Rollback completed successfully. All tables dropped.');
}

if (process.argv[1]?.endsWith('rollback.ts')) {
  runRollback()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Rollback failed:', err);
      process.exit(1);
    });
}
