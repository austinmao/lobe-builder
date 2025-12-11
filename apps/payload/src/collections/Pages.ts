import type { CollectionConfig } from 'payload';

import { CTABlock, FeaturesBlock, HeroBlock, TextBlock } from '../blocks';

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: 'Page',
    plural: 'Pages',
  },
  versions: {
    drafts: true,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'designSystem', 'updatedAt'],
  },
  access: {
    // Read access: Published pages are publicly readable, drafts require authentication
    // Admin users can read all pages, non-admin users can only read pages from their tenants
    read: ({ req: { user } }) => {
      // Public access: allow reading published pages without authentication
      // This enables the public landing page routes to fetch page data
      if (!user) {
        return {
          _status: {
            equals: 'published',
          },
        };
      }
      // Admin role can read all pages (plugin's userHasAccessToAllTenants handles this)
      if (user.roles?.includes('admin')) return true;
      // Non-admin users: return tenant constraint for cross-tenant isolation
      // Get tenant IDs from user's tenants array
      const tenantIds =
        user.tenants?.map((t: any) => {
          if (typeof t === 'object' && t !== null) {
            const tenantValue = t.tenant;
            if (typeof tenantValue === 'object' && tenantValue !== null) {
              return tenantValue.id;
            }
            return tenantValue || t.id;
          }
          return t;
        }) || [];

      // Return a query constraint that filters by tenant
      return {
        tenant: {
          in: tenantIds,
        },
      };
    },
    // Create access: Must be authenticated and have at least one tenant
    create: ({ req: { user } }) => {
      if (!user) return false;
      // Must have at least one tenant to create pages
      return (user.tenants?.length ?? 0) > 0;
    },
    // Update access: Admin users can update all pages, non-admin users can only update their tenant's pages
    update: ({ req: { user } }) => {
      if (!user) return false;
      // Admin role can update all pages
      if (user.roles?.includes('admin')) return true;
      // Non-admin users: return tenant constraint for cross-tenant isolation
      const tenantIds =
        user.tenants?.map((t: any) => {
          if (typeof t === 'object' && t !== null) {
            const tenantValue = t.tenant;
            if (typeof tenantValue === 'object' && tenantValue !== null) {
              return tenantValue.id;
            }
            return tenantValue || t.id;
          }
          return t;
        }) || [];

      return {
        tenant: {
          in: tenantIds,
        },
      };
    },
    // Delete access: Admin users can delete all pages, non-admin users can only delete their tenant's pages
    delete: ({ req: { user } }) => {
      if (!user) return false;
      // Admin role can delete all pages
      if (user.roles?.includes('admin')) return true;
      // Non-admin users: return tenant constraint for cross-tenant isolation
      const tenantIds =
        user.tenants?.map((t: any) => {
          if (typeof t === 'object' && t !== null) {
            const tenantValue = t.tenant;
            if (typeof tenantValue === 'object' && tenantValue !== null) {
              return tenantValue.id;
            }
            return tenantValue || t.id;
          }
          return t;
        }) || [];

      return {
        tenant: {
          in: tenantIds,
        },
      };
    },
  },
  fields: [
    // The multi-tenant plugin will automatically inject a 'tenant' relationship field here
    // pointing to the 'tenants' collection. The plugin handles:
    // - Automatic tenant assignment on create (from logged-in user's selected tenant)
    // - Filtering by tenant on read/update/delete operations
    // - Admin bypass for users with admin role
    {
      name: 'userId',
      type: 'text',
      required: true,
      index: true,
      label: 'User ID',
      admin: {
        description: 'The user who created this page',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug',
      admin: {
        description: 'URL-friendly identifier (lowercase alphanumeric with hyphens only)',
      },
      validate: (value: unknown): true | string => {
        if (typeof value !== 'string') {
          return 'Slug must be a string';
        }
        // Validate lowercase alphanumeric with hyphens only
        const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
        if (!slugRegex.test(value)) {
          return 'Slug must be lowercase alphanumeric with hyphens only (no uppercase, no special characters)';
        }
        return true;
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Page Title',
    },
    {
      name: 'designSystem',
      type: 'select',
      required: true,
      defaultValue: 'untitledui',
      label: 'Design System',
      options: [
        {
          label: 'Untitled UI',
          value: 'untitledui',
        },
        {
          label: 'shadcn/ui',
          value: 'shadcn',
        },
      ],
      admin: {
        description: 'The design system to use for rendering this page',
      },
    },
    {
      name: 'sections',
      type: 'blocks',
      required: true,
      minRows: 1,
      label: 'Page Sections',
      blocks: [HeroBlock, TextBlock, CTABlock, FeaturesBlock],
      admin: {
        description: 'Add and arrange sections for this page',
      },
    },
    // SEO Fields
    {
      name: 'meta',
      type: 'group',
      label: 'SEO & Social Sharing',
      fields: [
        {
          name: 'description',
          type: 'textarea',
          label: 'Meta Description',
          maxLength: 160,
          admin: {
            description: 'Brief description for search engines (recommended: 150-160 characters)',
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Social Sharing Image',
          admin: {
            description: 'Image for Open Graph and Twitter Cards (recommended: 1200x630px)',
          },
        },
      ],
    },
  ],
};
