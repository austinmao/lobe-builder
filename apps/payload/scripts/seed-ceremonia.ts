import dotenv from 'dotenv';
import path from 'path';
import { getPayload } from 'payload';
import { fileURLToPath } from 'url';

import config from '../payload.config.js';

// Load environment variables from project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const CEREMONIA_EMAIL = process.env.CEREMONIA_ADMIN_EMAIL || 'admin@ceremoniacircle.org';
const CEREMONIA_PASSWORD = process.env.CEREMONIA_ADMIN_PASSWORD || 'ceremonia_secure_password_123';
const TENANT_NAME = 'Ceremonia';
const TENANT_SLUG = 'ceremonia';

async function seedCeremonia(): Promise<void> {
  try {
    console.log('🌱 Starting Ceremonia tenant and user seed...');

    // Initialize Payload
    const payload = await getPayload({
      config,
    });

    // Step 1: Check if Ceremonia tenant already exists
    console.log('\n📦 Checking for Ceremonia tenant...');
    const existingTenants = await payload.find({
      collection: 'tenants',
      where: {
        slug: {
          equals: TENANT_SLUG,
        },
      },
      limit: 1,
    });

    let tenantId: string;

    if (existingTenants.docs.length > 0) {
      tenantId = existingTenants.docs[0].id;
      console.log(`✅ Ceremonia tenant already exists: ${TENANT_NAME} (ID: ${tenantId})`);
    } else {
      // Create Ceremonia tenant
      console.log('📦 Creating Ceremonia tenant...');
      const tenant = await payload.create({
        collection: 'tenants',
        data: {
          name: TENANT_NAME,
          slug: TENANT_SLUG,
          domain: 'ceremoniacircle.org', // Optional: custom domain
        },
      });
      tenantId = tenant.id;
      console.log(`✅ Ceremonia tenant created: ${TENANT_NAME} (ID: ${tenantId})`);
    }

    // Step 2: Check if Ceremonia user already exists
    console.log('\n👤 Checking for Ceremonia user...');
    const existingUsers = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: CEREMONIA_EMAIL,
        },
      },
      limit: 1,
    });

    if (existingUsers.docs.length > 0) {
      console.log(`✅ Ceremonia user already exists: ${CEREMONIA_EMAIL}`);
      console.log(`   ID: ${existingUsers.docs[0].id}`);
      console.log(`   Roles: ${existingUsers.docs[0].roles?.join(', ')}`);
      process.exit(0);
    }

    // Step 3: Create Ceremonia user with tenant relationship
    console.log('👤 Creating Ceremonia user...');
    const ceremoniaUser = await payload.create({
      collection: 'users',
      data: {
        email: CEREMONIA_EMAIL,
        password: CEREMONIA_PASSWORD,
        roles: ['user'], // Regular user role, not admin (can only access own tenant)
        // The multi-tenant plugin expects a 'tenants' array with objects containing 'tenant' relationship
        tenants: [
          {
            tenant: tenantId, // Relationship to the tenant
          },
        ],
      },
    });

    console.log(`✅ Ceremonia user created successfully: ${ceremoniaUser.email}`);
    console.log(`   ID: ${ceremoniaUser.id}`);
    console.log(`   Roles: ${ceremoniaUser.roles?.join(', ')}`);
    console.log(`   Tenant: ${TENANT_NAME} (${TENANT_SLUG})`);
    console.log(`\n🔐 Login credentials:`);
    console.log(`   Email: ${CEREMONIA_EMAIL}`);
    console.log(`   Password: ${CEREMONIA_PASSWORD}`);
    console.log(
      `\n📝 Note: Store credentials in CEREMONIA_ADMIN_EMAIL and CEREMONIA_ADMIN_PASSWORD environment variables`,
    );

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding Ceremonia tenant/user:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  }
}

seedCeremonia();
