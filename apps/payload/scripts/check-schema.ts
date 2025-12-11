/**
 * Check database schema for tenants table
 */
import dotenv from 'dotenv';
import path from 'path';
import { Client } from 'pg';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function checkSchema(): Promise<void> {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check tenants table schema
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'tenants'
      ORDER BY ordinal_position;
    `);

    console.log('\n📋 Tenants table schema:');
    result.rows.forEach((row) => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

    // Check migrations status
    const migrationsResult = await client.query(`
      SELECT name, executed_at
      FROM payload_migrations
      ORDER BY executed_at DESC
      LIMIT 10;
    `);

    console.log('\n📜 Recent migrations:');
    migrationsResult.rows.forEach((row) => {
      console.log(`  - ${row.name} (executed: ${row.executed_at})`);
    });
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkSchema();
