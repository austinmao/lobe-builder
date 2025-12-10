import { postgresAdapter } from '@payloadcms/db-postgres';
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { buildConfig } from 'payload';
import { fileURLToPath } from 'url';

import { Media } from './src/collections/Media';
import { Pages } from './src/collections/Pages';
import { Tenants } from './src/collections/Tenants';
import { Users } from './src/collections/Users';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  // Database adapter configuration
  db: postgresAdapter({
    // Use DATABASE_URL environment variable to connect to the same PostgreSQL database
    // that LobeChat uses with Drizzle ORM
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    // Add 'payload_' prefix to all Payload tables to avoid conflicts with Drizzle tables
    // Note: Payload will automatically create tables like 'payload_users', 'payload_pages', etc.
    migrationDir: path.resolve(dirname, 'migrations'),
    push: false,
  }),

  // Collections
  collections: [Users, Tenants, Pages, Media],

  // Rich text editor
  editor: lexicalEditor({}),

  // Secret for JWT encryption
  secret: process.env.PAYLOAD_SECRET || 'your-secret-key-here',

  // TypeScript configuration
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  // Plugins
  plugins: [
    multiTenantPlugin({
      // Collections that should be tenant-aware
      collections: {
        pages: {
          // Standard tenant-aware collection
          // Plugin will add tenant field and access control
        },
      },
      // Function to determine if user has access to all tenants (admin bypass)
      userHasAccessToAllTenants: (user) => {
        if (!user) return false;
        return user.roles?.includes('admin') === true;
      },
      // Configure the tenants collection
      tenantsSlug: 'tenants',
      // Enable tenant filtering in admin UI
      useTenantsListFilter: true,
      // Configure Users collection tenant field
      tenantsArrayField: {
        // Plugin will automatically inject tenants array field
        includeDefaultField: true,
        arrayFieldName: 'tenants',
        arrayTenantFieldName: 'tenant',
      },
      // Enable user filtering by selected tenant
      useUsersTenantFilter: true,
      // Cleanup documents when tenant is deleted
      cleanupAfterTenantDelete: true,
    }),
  ],

  // Admin UI configuration
  admin: {
    user: 'users', // Enable authentication with Users collection
    meta: {
      titleSuffix: '- LobeChat CMS',
    },
  },

  // Server URL - will be overridden in server.ts
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3011',

  // CORS configuration
  cors: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3011',
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3010',
  ].filter(Boolean),

  // CSRF protection
  csrf: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3011',
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3010',
  ].filter(Boolean),
});
