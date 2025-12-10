import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { afterAll, beforeAll } from 'vitest';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const rootDir = path.resolve(dirname, '../../..');

// Load environment variables for tests
dotenv.config({ path: path.resolve(rootDir, '.env') });
dotenv.config({ path: path.resolve(rootDir, '.env.local') });

// Set test environment variables if not already set
process.env.PAYLOAD_SECRET = process.env.PAYLOAD_SECRET || 'test-secret-key';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/lobechat_test';

beforeAll(() => {
  // Setup test environment
});

afterAll(() => {
  // Cleanup test environment
});
