/**
 * Script to create the first Ceremonia landing page in Payload CMS
 * "Softening the Season: 3 Simple Skills for Connection in the Chaos"
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

interface TenantResponse {
  docs: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

interface PageResponse {
  id: string;
  slug: string;
  title: string;
  designSystem: string;
  _status: string;
}

async function createFirstLandingPage(): Promise<void> {
  try {
    console.log('🚀 Creating first Ceremonia landing page...\n');

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

    // Step 2: Get Ceremonia tenant ID
    console.log('📦 Fetching Ceremonia tenant...');
    const tenantResponse = await fetch(`${PAYLOAD_URL}/api/tenants?where[slug][equals]=ceremonia`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!tenantResponse.ok) {
      throw new Error(
        `Failed to fetch tenant: ${tenantResponse.status} ${tenantResponse.statusText}`,
      );
    }

    const tenantData: TenantResponse = await tenantResponse.json();

    if (tenantData.docs.length === 0) {
      throw new Error('Ceremonia tenant not found. Please run seed-ceremonia script first.');
    }

    const tenantId = tenantData.docs[0].id;
    console.log(`✅ Found tenant: ${tenantData.docs[0].name} (ID: ${tenantId})\n`);

    // Step 3: Check if page already exists
    const pageSlug = 'softening-the-season-3-simple-skills-for-connection-in-the-chaos';
    console.log('📄 Checking if landing page already exists...');
    const existingPageResponse = await fetch(
      `${PAYLOAD_URL}/api/pages?where[slug][equals]=${pageSlug}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!existingPageResponse.ok) {
      throw new Error(
        `Failed to check existing pages: ${existingPageResponse.status} ${existingPageResponse.statusText}`,
      );
    }

    const existingPageData: { docs: PageResponse[] } = await existingPageResponse.json();

    if (existingPageData.docs.length > 0) {
      const existingPage = existingPageData.docs[0];
      console.log('✅ Landing page already exists!\n');
      console.log(`📝 Page Details:`);
      console.log(`   ID: ${existingPage.id}`);
      console.log(`   Slug: ${existingPage.slug}`);
      console.log(`   Title: ${existingPage.title}`);
      console.log(`   Design System: ${existingPage.designSystem}`);
      console.log(`   Status: ${existingPage._status}`);
      console.log(`\n🔗 Preview URL: ${PAYLOAD_URL}/preview/ceremonia/${existingPage.slug}`);
      console.log(`\n✨ Task complete!`);
      return;
    }

    // Step 4: Create the landing page
    console.log('📄 Creating landing page...');
    const pageData = {
      slug: 'softening-the-season-3-simple-skills-for-connection-in-the-chaos',
      title: 'Softening the Season: 3 Simple Skills for Connection in the Chaos',
      userId: String(user.id),
      tenant: String(tenantId),
      designSystem: 'untitledui',
      _status: 'draft',
      meta: {
        description:
          'Join us for a transformative workshop exploring 3 essential skills for emotional regulation, deeper connection, and mindful presence during the holiday season.',
      },
      sections: [
        {
          blockType: 'hero',
          title: 'Softening the Season',
          subtitle: '3 Simple Skills for Connection in the Chaos',
          ctaLabel: 'Join Us',
          ctaHref: '#register',
        },
        {
          blockType: 'features',
          heading: "What You'll Learn",
          items: [
            {
              title: 'Emotional Regulation',
              description: 'Tools to manage stress during the holidays',
              icon: 'heart',
            },
            {
              title: 'Connection Skills',
              description: 'Deepen relationships with loved ones',
              icon: 'users',
            },
            {
              title: 'Mindfulness Practices',
              description: 'Stay present amidst the chaos',
              icon: 'brain',
            },
          ],
        },
        {
          blockType: 'cta',
          heading: 'Ready to Transform Your Holidays?',
          description: 'Join us for this transformative workshop',
          primaryButton: {
            label: 'Register Now',
            href: '#register',
          },
        },
      ],
    };

    const createResponse = await fetch(`${PAYLOAD_URL}/api/pages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(pageData),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(
        `Failed to create page: ${createResponse.status} ${createResponse.statusText}\n${errorText}`,
      );
    }

    const responseData = await createResponse.json();
    console.log('Debug - Full response:', JSON.stringify(responseData, null, 2));

    const createdPage = responseData.doc || responseData;
    console.log(`✅ Landing page created successfully!\n`);
    console.log(`📝 Page Details:`);
    console.log(`   ID: ${createdPage.id}`);
    console.log(`   Slug: ${createdPage.slug}`);
    console.log(`   Title: ${createdPage.title}`);
    console.log(`   Design System: ${createdPage.designSystem}`);
    console.log(`   Status: ${createdPage._status}`);
    console.log(`\n🔗 Preview URL: ${PAYLOAD_URL}/preview/ceremonia/${createdPage.slug}`);
    console.log(`\n✨ Task complete!`);
  } catch (error) {
    console.error('❌ Error creating landing page:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
    }
    process.exit(1);
  }
}

createFirstLandingPage();
