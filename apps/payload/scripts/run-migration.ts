/**
 * Run Payload migrations manually
 *
 * This script runs the pending migrations to add domain fields to tenants table.
 */
import dotenv from 'dotenv';
import path from 'path';
import { getPayload } from 'payload';
import { fileURLToPath } from 'url';

import config from '../payload.config.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function runMigrations(): Promise<void> {
  try {
    console.log('🔧 Running Payload migrations...');

    // Initialize Payload (this will run pending migrations)
    const payload = await getPayload({
      config,
    });

    console.log('✅ Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running migrations:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  }
}

runMigrations();
