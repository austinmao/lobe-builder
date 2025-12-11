/**
 * Manually apply domain fields migration to tenants table
 */
import dotenv from 'dotenv';
import path from 'path';
import { Client } from 'pg';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function applyMigration(): Promise<void> {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    console.log('\n🔧 Creating enum type for domain_status...');
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."enum_tenants_domain_status" AS ENUM('pending_verification', 'verified');
      EXCEPTION
        WHEN duplicate_object THEN
          RAISE NOTICE 'enum_tenants_domain_status already exists, skipping';
      END $$;
    `);
    console.log('✅ Enum type created/exists');

    console.log('\n🔧 Adding domain_status column...');
    await client.query(`
      ALTER TABLE "tenants"
      ADD COLUMN IF NOT EXISTS "domain_status" "enum_tenants_domain_status";
    `);
    console.log('✅ domain_status column added');

    console.log('\n🔧 Adding domain_verification_records column...');
    await client.query(`
      ALTER TABLE "tenants"
      ADD COLUMN IF NOT EXISTS "domain_verification_records" jsonb;
    `);
    console.log('✅ domain_verification_records column added');

    // Verify the columns now exist
    const result = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'tenants'
      AND column_name IN ('domain_status', 'domain_verification_records');
    `);

    console.log('\n📋 Verified columns:');
    result.rows.forEach((row) => {
      console.log(`  ✓ ${row.column_name}: ${row.data_type}`);
    });

    if (result.rows.length === 2) {
      console.log('\n🎉 Migration completed successfully!');
    } else {
      console.log('\n⚠️ Warning: Expected 2 columns, found', result.rows.length);
    }
  } catch (error) {
    console.error('\n❌ Error applying migration:', error);
    throw error;
  } finally {
    await client.end();
  }
}

applyMigration();
