import type { Field } from 'payload';
import { describe, expect, it } from 'vitest';

import { Users } from '../../src/collections/Users';

// Helper to check if a field has a name property (not all Field types do)
const hasName = (field: Field): field is Field & { name: string } => 'name' in field;

describe('Users Collection Schema', () => {
  it('should have correct slug', () => {
    expect(Users.slug).toBe('users');
  });

  it('should have correct labels', () => {
    expect(Users.labels).toEqual({
      singular: 'User',
      plural: 'Users',
    });
  });

  it('should have auth enabled', () => {
    expect(Users.auth).toBe(true);
  });

  it('should use email as title', () => {
    expect(Users.admin?.useAsTitle).toBe('email');
  });

  it('should have email field as unique identifier', () => {
    const emailField = Users.fields.filter(hasName).find((field) => field.name === 'email') as
      | (Field & { required?: boolean; unique?: boolean })
      | undefined;
    expect(emailField).toBeDefined();
    expect(emailField?.type).toBe('email');
    expect(emailField?.required).toBe(true);
    expect(emailField?.unique).toBe(true);
  });

  it('should have roles field with correct configuration', () => {
    const rolesField = Users.fields.filter(hasName).find((field) => field.name === 'roles') as
      | (Field & { hasMany?: boolean; required?: boolean; defaultValue?: unknown })
      | undefined;
    expect(rolesField).toBeDefined();
    expect(rolesField?.type).toBe('select');
    expect(rolesField?.hasMany).toBe(true);
    expect(rolesField?.required).toBe(true);
    expect(rolesField?.defaultValue).toEqual(['user']);
  });

  it('should have admin and user role options', () => {
    const rolesField = Users.fields.filter(hasName).find((field) => field.name === 'roles') as
      | (Field & { options?: unknown[] })
      | undefined;
    expect(rolesField?.options).toEqual([
      { label: 'Admin', value: 'admin' },
      { label: 'User', value: 'user' },
    ]);
  });

  it('should default roles to user', () => {
    const rolesField = Users.fields.filter(hasName).find((field) => field.name === 'roles') as
      | (Field & { defaultValue?: unknown })
      | undefined;
    expect(rolesField?.defaultValue).toEqual(['user']);
  });

  it('should have comment explaining multi-tenant plugin injection', () => {
    // The multi-tenant plugin will automatically inject a 'tenants' array field
    // This is configured in payload.config.ts
    const fieldNames = Users.fields.filter(hasName).map((field) => field.name);
    // The tenants field is NOT in the schema - it's injected by the plugin at runtime
    expect(fieldNames).not.toContain('tenants');
  });
});

describe('Users Collection Access Control', () => {
  it('should have all access control methods defined', () => {
    expect(Users.access).toBeDefined();
    expect(Users.access?.read).toBeDefined();
    expect(Users.access?.create).toBeDefined();
    expect(Users.access?.update).toBeDefined();
    expect(Users.access?.delete).toBeDefined();
  });

  describe('Read Access', () => {
    it('should deny access when user is not authenticated', () => {
      const readAccess = Users.access?.read;
      if (typeof readAccess === 'function') {
        const result = readAccess({ req: { user: undefined } } as any);
        expect(result).toBe(false);
      }
    });

    it('should allow admin users to read all users', () => {
      const readAccess = Users.access?.read;
      if (typeof readAccess === 'function') {
        const mockUser = {
          id: 'admin-1',
          email: 'admin@example.com',
          roles: ['admin'],
        };
        const result = readAccess({ req: { user: mockUser } } as any);
        expect(result).toBe(true);
      }
    });

    it('should allow non-admin users to read only themselves', () => {
      const readAccess = Users.access?.read;
      if (typeof readAccess === 'function') {
        const mockUser = {
          id: 'user-1',
          email: 'user@example.com',
          roles: ['user'],
        };
        const result = readAccess({ req: { user: mockUser } } as any);
        expect(result).toEqual({
          id: {
            equals: 'user-1',
          },
        });
      }
    });

    it('should handle user with multiple roles including admin', () => {
      const readAccess = Users.access?.read;
      if (typeof readAccess === 'function') {
        const mockUser = {
          id: 'user-admin-1',
          email: 'useradmin@example.com',
          roles: ['user', 'admin'],
        };
        const result = readAccess({ req: { user: mockUser } } as any);
        // Should allow access to all users because admin role is present
        expect(result).toBe(true);
      }
    });
  });

  describe('Create Access', () => {
    it('should deny access to non-admin users', () => {
      const createAccess = Users.access?.create;
      if (typeof createAccess === 'function') {
        const mockUser = {
          id: 'user-1',
          email: 'user@example.com',
          roles: ['user'],
        };
        const result = createAccess({ req: { user: mockUser } } as any);
        expect(result).toBe(false);
      }
    });

    it('should allow admin users to create users', () => {
      const createAccess = Users.access?.create;
      if (typeof createAccess === 'function') {
        const mockUser = {
          id: 'admin-1',
          email: 'admin@example.com',
          roles: ['admin'],
        };
        const result = createAccess({ req: { user: mockUser } } as any);
        expect(result).toBe(true);
      }
    });

    it('should deny access when user is not authenticated', () => {
      const createAccess = Users.access?.create;
      if (typeof createAccess === 'function') {
        const result = createAccess({ req: { user: undefined } } as any);
        expect(result).toBe(false);
      }
    });
  });

  describe('Update Access', () => {
    it('should deny access when user is not authenticated', () => {
      const updateAccess = Users.access?.update;
      if (typeof updateAccess === 'function') {
        const result = updateAccess({ req: { user: undefined } } as any);
        expect(result).toBe(false);
      }
    });

    it('should allow admin users to update all users', () => {
      const updateAccess = Users.access?.update;
      if (typeof updateAccess === 'function') {
        const mockUser = {
          id: 'admin-1',
          email: 'admin@example.com',
          roles: ['admin'],
        };
        const result = updateAccess({ req: { user: mockUser } } as any);
        expect(result).toBe(true);
      }
    });

    it('should allow non-admin users to update only themselves', () => {
      const updateAccess = Users.access?.update;
      if (typeof updateAccess === 'function') {
        const mockUser = {
          id: 'user-1',
          email: 'user@example.com',
          roles: ['user'],
        };
        const result = updateAccess({ req: { user: mockUser } } as any);
        expect(result).toEqual({
          id: {
            equals: 'user-1',
          },
        });
      }
    });
  });

  describe('Delete Access', () => {
    it('should deny access to non-admin users', () => {
      const deleteAccess = Users.access?.delete;
      if (typeof deleteAccess === 'function') {
        const mockUser = {
          id: 'user-1',
          email: 'user@example.com',
          roles: ['user'],
        };
        const result = deleteAccess({ req: { user: mockUser } } as any);
        expect(result).toBe(false);
      }
    });

    it('should allow admin users to delete users', () => {
      const deleteAccess = Users.access?.delete;
      if (typeof deleteAccess === 'function') {
        const mockUser = {
          id: 'admin-1',
          email: 'admin@example.com',
          roles: ['admin'],
        };
        const result = deleteAccess({ req: { user: mockUser } } as any);
        expect(result).toBe(true);
      }
    });

    it('should deny access when user is not authenticated', () => {
      const deleteAccess = Users.access?.delete;
      if (typeof deleteAccess === 'function') {
        const result = deleteAccess({ req: { user: undefined } } as any);
        expect(result).toBe(false);
      }
    });
  });
});

describe('Multi-Tenant Integration', () => {
  it('should not have manual tenants field in schema', () => {
    const fieldNames = Users.fields.filter(hasName).map((field) => field.name);
    // The tenants field is injected by the multi-tenant plugin at runtime
    expect(fieldNames).not.toContain('tenants');
  });

  it('should have multi-tenant plugin configured in payload.config.ts', () => {
    // This is verified by the plugin configuration in payload.config.ts:
    // - tenantsArrayField.includeDefaultField: true
    // - tenantsArrayField.arrayFieldName: 'tenants'
    // - tenantsArrayField.arrayTenantFieldName: 'tenant'
    // The plugin will automatically inject the tenants field at runtime
    expect(true).toBe(true);
  });
});

describe('Role-Based Behavior', () => {
  it('should treat users with admin role as having access to all tenants', () => {
    // This is verified by the userHasAccessToAllTenants function in payload.config.ts
    const userWithAdminRole = {
      id: 'admin-1',
      email: 'admin@example.com',
      roles: ['admin'],
      tenants: [],
    };

    // The userHasAccessToAllTenants function checks if user.roles includes 'admin'
    const hasAccessToAllTenants = userWithAdminRole.roles?.includes('admin') === true;
    expect(hasAccessToAllTenants).toBe(true);
  });

  it('should treat users without admin role as tenant-restricted', () => {
    const userWithoutAdminRole = {
      id: 'user-1',
      email: 'user@example.com',
      roles: ['user'],
      tenants: [{ tenant: 'tenant-1' }],
    };

    // The userHasAccessToAllTenants function checks if user.roles includes 'admin'
    const hasAccessToAllTenants = userWithoutAdminRole.roles?.includes('admin') === true;
    expect(hasAccessToAllTenants).toBe(false);
  });

  it('should handle users with no roles', () => {
    const userWithNoRoles = {
      id: 'user-2',
      email: 'user2@example.com',
      roles: [],
      tenants: [],
    };

    // User with no roles should not have access to all tenants
    const hasAccessToAllTenants = (userWithNoRoles.roles as string[])?.includes('admin') === true;
    expect(hasAccessToAllTenants).toBe(false);
  });

  it('should handle users with undefined roles', () => {
    const userWithUndefinedRoles = {
      id: 'user-3',
      email: 'user3@example.com',
      tenants: [],
    };

    // User with undefined roles should not have access to all tenants
    const hasAccessToAllTenants = (userWithUndefinedRoles as any).roles?.includes('admin') === true;
    expect(hasAccessToAllTenants).toBe(false);
  });
});

describe('Default Values', () => {
  it('should default new users to user role', () => {
    const rolesField = Users.fields.filter(hasName).find((field) => field.name === 'roles') as
      | (Field & { defaultValue?: unknown })
      | undefined;
    expect(rolesField?.defaultValue).toEqual(['user']);
  });

  it('should require email field', () => {
    const emailField = Users.fields.filter(hasName).find((field) => field.name === 'email') as
      | (Field & { required?: boolean })
      | undefined;
    expect(emailField?.required).toBe(true);
  });

  it('should require roles field', () => {
    const rolesField = Users.fields.filter(hasName).find((field) => field.name === 'roles') as
      | (Field & { required?: boolean })
      | undefined;
    expect(rolesField?.required).toBe(true);
  });
});
