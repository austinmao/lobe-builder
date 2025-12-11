import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres';

/**
 * Migration: Add domain status and verification fields to tenants table
 *
 * Adds:
 * - domain_status: Status of custom domain verification (pending_verification | verified)
 * - domain_verification_records: DNS records needed for domain verification (JSON)
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Create enum type for domain status
    DO $$ BEGIN
      CREATE TYPE "public"."enum_tenants_domain_status" AS ENUM('pending_verification', 'verified');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    -- Add domain_status column
    ALTER TABLE "tenants"
    ADD COLUMN IF NOT EXISTS "domain_status" "enum_tenants_domain_status";

    -- Add domain_verification_records column (JSON)
    ALTER TABLE "tenants"
    ADD COLUMN IF NOT EXISTS "domain_verification_records" jsonb;
  `);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    -- Remove domain_verification_records column
    ALTER TABLE "tenants"
    DROP COLUMN IF EXISTS "domain_verification_records";

    -- Remove domain_status column
    ALTER TABLE "tenants"
    DROP COLUMN IF EXISTS "domain_status";

    -- Drop enum type (only if not used elsewhere)
    DROP TYPE IF EXISTS "public"."enum_tenants_domain_status";
  `);
}
