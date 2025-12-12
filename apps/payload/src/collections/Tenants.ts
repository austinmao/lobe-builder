import type { CollectionConfig } from 'payload';

/**
 * Check if request has valid service authentication
 * Service auth uses PAYLOAD_SERVICE_SECRET header for service-to-service calls
 *
 * Note: Payload CMS may provide headers as either:
 * - Web API Headers object (with .get() method)
 * - Plain Node.js-style object (with direct property access)
 */
function hasServiceAuth(req: { headers: unknown }): boolean {
  const serviceSecret = process.env.PAYLOAD_SERVICE_SECRET;
  if (!serviceSecret) return false;

  const headers = req.headers;
  let requestSecret: string | null = null;

  // Handle Web API Headers object (has .get method)
  if (headers && typeof (headers as Headers).get === 'function') {
    requestSecret = (headers as Headers).get('x-payload-service-secret');
  }
  // Handle Node.js-style plain object headers
  else if (headers && typeof headers === 'object') {
    const headersObj = headers as Record<string, string | string[] | undefined>;
    const value = headersObj['x-payload-service-secret'];
    requestSecret = Array.isArray(value) ? value[0] : value || null;
  }

  return requestSecret === serviceSecret;
}

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
    // Tenant read is public for service-to-service calls (routing, domain resolution)
    // Tenant data (name, slug, domain) is not sensitive
    // For authenticated users, restrict to their own tenants unless admin
    read: ({ req: { user } }) => {
      // Allow public read access for service-to-service calls
      // This enables the main app to query tenant info for routing
      if (!user) return true;
      // Admin role can read all tenants
      if (user.roles?.includes('admin')) return true;
      // Non-admin users can only read their own tenants
      return {
        id: {
          in:
            user.tenants?.map((t: any) => {
              if (typeof t === 'object' && t !== null) {
                // Handle populated tenant relationships: t.tenant might be an object or an ID
                const tenantValue = t.tenant;
                if (typeof tenantValue === 'object' && tenantValue !== null) {
                  return tenantValue.id;
                }
                return tenantValue || t.id;
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
    update: ({ req }) => {
      const { user } = req;
      // Allow service-to-service calls with valid service secret
      // This enables the main app to update tenant domain settings
      if (hasServiceAuth(req)) return true;
      // Admin users can update tenants via admin UI
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
    {
      name: 'domainStatus',
      type: 'select',
      options: [
        { label: 'Pending Verification', value: 'pending_verification' },
        { label: 'Verified', value: 'verified' },
      ],
      admin: {
        description: 'Status of custom domain verification',
      },
    },
    {
      name: 'domainVerificationRecords',
      type: 'json',
      admin: {
        description: 'DNS records needed for domain verification',
      },
    },
  ],
};
