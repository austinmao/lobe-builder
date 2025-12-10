import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import payload from 'payload';
import { fileURLToPath } from 'url';

import config from '../payload.config.js';

// Load environment variables from root .env file
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const rootDir = path.resolve(dirname, '../../..');

dotenv.config({ path: path.resolve(rootDir, '.env') });
dotenv.config({ path: path.resolve(rootDir, '.env.local') });

const app = express();
const PORT = process.env.PAYLOAD_PORT || 3011;

// Redirect root to Admin panel
app.get('/', (_, res) => {
  res.redirect('/admin');
});

/**
 * Initialize Payload CMS
 */
const start = async (): Promise<void> => {
  // Initialize Payload
  await payload.init({
    config,
    // @ts-expect-error - Payload v3 API types may be incomplete
    express: app,
    onInit: async () => {
      payload.logger.info(`Payload Admin URL: http://localhost:${PORT}${payload.getAdminURL()}`);
    },
  });

  // Start Express server
  app.listen(PORT, () => {
    console.log(`\n🚀 Payload CMS server started successfully!`);
    console.log(`📍 Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`📊 Database: PostgreSQL (shared with LobeChat)`);
    console.log(`🏷️  Table Prefix: payload_`);
    console.log(`\nPress Ctrl+C to stop the server\n`);
  });
};

start().catch((error) => {
  console.error('❌ Failed to start Payload server:', error);
  process.exit(1);
});
