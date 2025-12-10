import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'User',
    plural: 'Users',
  },
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'roles', 'updatedAt'],
  },
  access: {
    // Admin users can read all users
    // Non-admin users can only read themselves
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.roles?.includes('admin')) return true;
      return {
        id: {
          equals: user.id,
        },
      };
    },
    // Only admin users can create users
    create: ({ req: { user } }) => {
      return user?.roles?.includes('admin') === true;
    },
    // Admin users can update all users
    // Non-admin users can only update themselves
    update: ({ req: { user } }) => {
      if (!user) return false;
      if (user.roles?.includes('admin')) return true;
      return {
        id: {
          equals: user.id,
        },
      };
    },
    // Only admin users can delete users
    delete: ({ req: { user } }) => {
      return user?.roles?.includes('admin') === true;
    },
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      label: 'Email Address',
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      defaultValue: ['user'],
      required: true,
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'User',
          value: 'user',
        },
      ],
      label: 'User Roles',
      admin: {
        description: 'Admin users can access all tenants',
      },
    },
    // The multi-tenant plugin will automatically inject a 'tenants' array field here
    // with the structure:
    // tenants: [
    //   {
    //     tenant: relationship to 'tenants' collection
    //     // additional custom fields can be added via plugin config
    //   }
    // ]
  ],
};
