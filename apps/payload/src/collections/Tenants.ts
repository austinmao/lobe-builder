import type { CollectionConfig } from 'payload';

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  labels: {
    singular: 'Tenant',
    plural: 'Tenants',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'domain', 'updatedAt'],
  },
  access: {
    // Admin users can manage all tenants
    // Non-admin users will have restricted access (configured by plugin)
    read: ({ req: { user } }) => {
      if (!user) return false;
      // Admin role can read all tenants
      if (user.roles?.includes('admin')) return true;
      // Non-admin users can only read their own tenants
      return {
        id: {
          in:
            user.tenants?.map((t: any) => {
              if (typeof t === 'object' && t !== null) {
                // Handle both {tenant: 'id'} and {id: 'id'} structures
                return t.tenant || t.id;
              }
              return t;
            }) || [],
        },
      };
    },
    create: ({ req: { user } }) => {
      // Only admin users can create tenants
      return user?.roles?.includes('admin') === true;
    },
    update: ({ req: { user } }) => {
      // Only admin users can update tenants
      return user?.roles?.includes('admin') === true;
    },
    delete: ({ req: { user } }) => {
      // Only admin users can delete tenants
      return user?.roles?.includes('admin') === true;
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Tenant Name',
      admin: {
        description: 'Display name for this tenant',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Tenant Slug',
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
          return 'Slug must be lowercase alphanumeric with hyphens only';
        }
        return true;
      },
    },
    {
      name: 'domain',
      type: 'text',
      label: 'Domain',
      admin: {
        description: 'Optional custom domain for this tenant',
      },
    },
  ],
};
