import dotenv from 'dotenv';
import { getPayload } from 'payload';

import config from '../payload.config.js';

// Load environment variables
dotenv.config();

const ADMIN_EMAIL = process.env.PAYLOAD_ADMIN_EMAIL || 'admin@lobechat.com';
const ADMIN_PASSWORD = process.env.PAYLOAD_ADMIN_PASSWORD || 'admin123';

async function seedAdmin(): Promise<void> {
  try {
    console.log('🌱 Starting admin user seed...');

    // Initialize Payload
    const payload = await getPayload({
      config,
    });

    // Check if admin user already exists
    const existingAdmins = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: ADMIN_EMAIL,
        },
      },
      limit: 1,
    });

    if (existingAdmins.docs.length > 0) {
      console.log(`✅ Admin user already exists: ${ADMIN_EMAIL}`);
      process.exit(0);
    }

    // Create admin user
    const adminUser = await payload.create({
      collection: 'users',
      data: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        roles: ['admin'],
        // Note: tenants field will be auto-injected by multi-tenant plugin
        // Admin users with 'admin' role can access all tenants
      },
    });

    console.log(`✅ Admin user created successfully: ${adminUser.email}`);
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Roles: ${adminUser.roles?.join(', ')}`);
    console.log(`\n🔐 Login credentials:`);
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    process.exit(1);
  }
}

seedAdmin();
