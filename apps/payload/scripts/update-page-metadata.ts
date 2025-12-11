/**
 * Script to update the published page with SEO metadata
 */
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PAYLOAD_URL = 'http://localhost:3011';
const CEREMONIA_EMAIL = 'admin@ceremoniacircle.org';
const CEREMONIA_PASSWORD = 'ceremonia_secure_password_123';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

interface PageResponse {
  id: string;
  slug: string;
  title: string;
  meta?: {
    description?: string;
  };
}

async function updatePageMetadata(): Promise<void> {
  try {
    console.log('🚀 Updating page metadata...\n');

    // Step 1: Authenticate
    console.log('🔐 Authenticating...');
    const loginResponse = await fetch(`${PAYLOAD_URL}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: CEREMONIA_EMAIL,
        password: CEREMONIA_PASSWORD,
      }),
    });

    if (!loginResponse.ok) {
      throw new Error(`Authentication failed: ${loginResponse.status} ${loginResponse.statusText}`);
    }

    const loginData: LoginResponse = await loginResponse.json();
    const { token, user } = loginData;
    console.log(`✅ Authenticated as: ${user.email} (ID: ${user.id})\n`);

    // Step 2: Find the page
    const pageSlug = 'softening-the-season-3-simple-skills-for-connection-in-the-chaos';
    console.log('📄 Finding landing page...');
    const pageResponse = await fetch(`${PAYLOAD_URL}/api/pages?where[slug][equals]=${pageSlug}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!pageResponse.ok) {
      throw new Error(`Failed to find page: ${pageResponse.status} ${pageResponse.statusText}`);
    }

    const pageData: { docs: PageResponse[] } = await pageResponse.json();

    if (pageData.docs.length === 0) {
      throw new Error('Landing page not found.');
    }

    const page = pageData.docs[0];
    console.log(`✅ Found page: ${page.title} (ID: ${page.id})`);
    console.log(`   Current meta description: ${page.meta?.description || 'None'}\n`);

    // Step 3: Update the page with metadata
    console.log('📝 Updating page metadata...');
    const updateResponse = await fetch(`${PAYLOAD_URL}/api/pages/${page.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        meta: {
          description:
            'Join us for a transformative workshop exploring 3 essential skills for emotional regulation, deeper connection, and mindful presence during the holiday season.',
        },
      }),
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(
        `Failed to update page: ${updateResponse.status} ${updateResponse.statusText}\n${errorText}`,
      );
    }

    const updatedPage: { doc: PageResponse } = await updateResponse.json();
    console.log(`✅ Page metadata updated successfully!\n`);
    console.log(`📝 Meta Description:`);
    console.log(`   ${updatedPage.doc.meta?.description}`);
    console.log(`\n🔗 Public URL: ${PAYLOAD_URL}/page/ceremonia/${updatedPage.doc.slug}`);
    console.log(`\n✨ Task complete!`);
  } catch (error) {
    console.error('❌ Error updating page metadata:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
    }
    process.exit(1);
  }
}

updatePageMetadata();
