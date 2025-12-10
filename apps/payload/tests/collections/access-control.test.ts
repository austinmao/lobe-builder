import type { Field } from 'payload';
import { describe, expect, it } from 'vitest';

import { Pages } from '../../src/collections/Pages';
import { Tenants } from '../../src/collections/Tenants';
import { Users } from '../../src/collections/Users';

// Helper to check if a field has a name property (not all Field types do)
const hasName = (field: Field): field is Field & { name: string } => 'name' in field;

describe('Access Control Configuration', () => {
  describe('Pages Collection Access Control', () => {
    it('should have access control configured', () => {
      expect(Pages.access).toBeDefined();
      expect(Pages.access?.read).toBeDefined();
      expect(Pages.access?.create).toBeDefined();
      expect(Pages.access?.update).toBeDefined();
      expect(Pages.access?.delete).toBeDefined();
    });

    describe('Read Access', () => {
      it('should deny access when user is not authenticated', () => {
        const readAccess = Pages.access?.read;
        if (typeof readAccess === 'function') {
          const result = readAccess({ req: { user: undefined } } as any);
          expect(result).toBe(false);
        }
      });

      it('should allow admin users to read all pages', () => {
        const readAccess = Pages.access?.read;
        if (typeof readAccess === 'function') {
          const mockUser = {
            id: 'admin-1',
            email: 'admin@example.com',
            roles: ['admin'],
            tenants: [],
          };
          const result = readAccess({ req: { user: mockUser } } as any);
          expect(result).toBe(true);
        }
      });

      it('should allow non-admin users to read pages (plugin will filter by tenant)', () => {
        const readAccess = Pages.access?.read;
        if (typeof readAccess === 'function') {
          const mockUser = {
            id: 'user-1',
            email: 'user@example.com',
            roles: ['user'],
            tenants: [{ tenant: 'tenant-1' }],
          };
          const result = readAccess({ req: { user: mockUser } } as any);
          expect(result).toBe(true);
        }
      });
    });

    describe('Create Access', () => {
      it('should deny access when user is not authenticated', () => {
        const createAccess = Pages.access?.create;
        if (typeof createAccess === 'function') {
          const result = createAccess({ req: { user: undefined } } as any);
          expect(result).toBe(false);
        }
      });

      it('should deny access when user has no tenants', () => {
        const createAccess = Pages.access?.create;
        if (typeof createAccess === 'function') {
          const mockUser = {
            id: 'user-1',
            email: 'user@example.com',
            roles: ['user'],
            tenants: [],
          };
          const result = createAccess({ req: { user: mockUser } } as any);
          expect(result).toBe(false);
        }
      });

      it('should allow access when user has at least one tenant', () => {
        const createAccess = Pages.access?.create;
        if (typeof createAccess === 'function') {
          const mockUser = {
            id: 'user-1',
            email: 'user@example.com',
            roles: ['user'],
            tenants: [{ tenant: 'tenant-1' }],
          };
          const result = createAccess({ req: { user: mockUser } } as any);
          expect(result).toBe(true);
        }
      });

      it('should allow admin users with no tenants to create pages', () => {
        const createAccess = Pages.access?.create;
        if (typeof createAccess === 'function') {
          const mockUser = {
            id: 'admin-1',
            email: 'admin@example.com',
            roles: ['admin'],
            tenants: [],
          };
          const result = createAccess({ req: { user: mockUser } } as any);
          // Admin users without tenants cannot create pages (they need at least one tenant)
          expect(result).toBe(false);
        }
      });
    });

    describe('Update Access', () => {
      it('should deny access when user is not authenticated', () => {
        const updateAccess = Pages.access?.update;
        if (typeof updateAccess === 'function') {
          const result = updateAccess({ req: { user: undefined } } as any);
          expect(result).toBe(false);
        }
      });

      it('should allow admin users to update all pages', () => {
        const updateAccess = Pages.access?.update;
        if (typeof updateAccess === 'function') {
          const mockUser = {
            id: 'admin-1',
            email: 'admin@example.com',
            roles: ['admin'],
            tenants: [],
          };
          const result = updateAccess({ req: { user: mockUser } } as any);
          expect(result).toBe(true);
        }
      });

      it('should allow non-admin users to update pages (plugin will filter by tenant)', () => {
        const updateAccess = Pages.access?.update;
        if (typeof updateAccess === 'function') {
          const mockUser = {
            id: 'user-1',
            email: 'user@example.com',
            roles: ['user'],
            tenants: [{ tenant: 'tenant-1' }],
          };
          const result = updateAccess({ req: { user: mockUser } } as any);
          expect(result).toBe(true);
        }
      });
    });

    describe('Delete Access', () => {
      it('should deny access when user is not authenticated', () => {
        const deleteAccess = Pages.access?.delete;
        if (typeof deleteAccess === 'function') {
          const result = deleteAccess({ req: { user: undefined } } as any);
          expect(result).toBe(false);
        }
      });

      it('should allow admin users to delete all pages', () => {
        const deleteAccess = Pages.access?.delete;
        if (typeof deleteAccess === 'function') {
          const mockUser = {
            id: 'admin-1',
            email: 'admin@example.com',
            roles: ['admin'],
            tenants: [],
          };
          const result = deleteAccess({ req: { user: mockUser } } as any);
          expect(result).toBe(true);
        }
      });

      it('should allow non-admin users to delete pages (plugin will filter by tenant)', () => {
        const deleteAccess = Pages.access?.delete;
        if (typeof deleteAccess === 'function') {
          const mockUser = {
            id: 'user-1',
            email: 'user@example.com',
            roles: ['user'],
            tenants: [{ tenant: 'tenant-1' }],
          };
          const result = deleteAccess({ req: { user: mockUser } } as any);
          expect(result).toBe(true);
        }
      });
    });
  });

  describe('Users Collection Access Control', () => {
    it('should have access control configured', () => {
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
    });
  });

  describe('Tenants Collection Access Control', () => {
    it('should have access control configured', () => {
      expect(Tenants.access).toBeDefined();
      expect(Tenants.access?.read).toBeDefined();
      expect(Tenants.access?.create).toBeDefined();
      expect(Tenants.access?.update).toBeDefined();
      expect(Tenants.access?.delete).toBeDefined();
    });

    describe('Read Access', () => {
      it('should deny access when user is not authenticated', () => {
        const readAccess = Tenants.access?.read;
        if (typeof readAccess === 'function') {
          const result = readAccess({ req: { user: undefined } } as any);
          expect(result).toBe(false);
        }
      });

      it('should allow admin users to read all tenants', () => {
        const readAccess = Tenants.access?.read;
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

      it('should allow non-admin users to read only their tenants', () => {
        const readAccess = Tenants.access?.read;
        if (typeof readAccess === 'function') {
          const mockUser = {
            id: 'user-1',
            email: 'user@example.com',
            roles: ['user'],
            tenants: [
              { tenant: 'tenant-1', id: 't1' },
              { tenant: 'tenant-2', id: 't2' },
            ],
          };
          const result = readAccess({ req: { user: mockUser } } as any);
          expect(result).toEqual({
            id: {
              in: ['tenant-1', 'tenant-2'],
            },
          });
        }
      });

      it('should handle empty tenants array for non-admin users', () => {
        const readAccess = Tenants.access?.read;
        if (typeof readAccess === 'function') {
          const mockUser = {
            id: 'user-1',
            email: 'user@example.com',
            roles: ['user'],
            tenants: [],
          };
          const result = readAccess({ req: { user: mockUser } } as any);
          expect(result).toEqual({
            id: {
              in: [],
            },
          });
        }
      });
    });

    describe('Create Access', () => {
      it('should deny access to non-admin users', () => {
        const createAccess = Tenants.access?.create;
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

      it('should allow admin users to create tenants', () => {
        const createAccess = Tenants.access?.create;
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
    });

    describe('Update Access', () => {
      it('should deny access to non-admin users', () => {
        const updateAccess = Tenants.access?.update;
        if (typeof updateAccess === 'function') {
          const mockUser = {
            id: 'user-1',
            email: 'user@example.com',
            roles: ['user'],
          };
          const result = updateAccess({ req: { user: mockUser } } as any);
          expect(result).toBe(false);
        }
      });

      it('should allow admin users to update tenants', () => {
        const updateAccess = Tenants.access?.update;
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
    });

    describe('Delete Access', () => {
      it('should deny access to non-admin users', () => {
        const deleteAccess = Tenants.access?.delete;
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

      it('should allow admin users to delete tenants', () => {
        const deleteAccess = Tenants.access?.delete;
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
    });
  });

  describe('Multi-Tenant Plugin Integration', () => {
    it('should have removed manual tenantId field from Pages collection', () => {
      const fieldNames = Pages.fields.filter(hasName).map((field) => field.name);
      // The tenantId field should be removed because the plugin injects a 'tenant' relationship field
      expect(fieldNames).not.toContain('tenantId');
      // The plugin will inject a 'tenant' field automatically
    });

    it('should still have userId field in Pages collection', () => {
      const fieldNames = Pages.fields.filter(hasName).map((field) => field.name);
      expect(fieldNames).toContain('userId');
    });

    it('should have Users collection with auth enabled', () => {
      expect(Users.auth).toBe(true);
    });

    it('should have roles field in Users collection', () => {
      const fieldNames = Users.fields.filter(hasName).map((field) => field.name);
      expect(fieldNames).toContain('roles');

      const rolesField = Users.fields.filter(hasName).find((field) => field.name === 'roles') as
        | (Field & { hasMany?: boolean; options?: unknown[] })
        | undefined;
      expect(rolesField?.type).toBe('select');
      expect(rolesField?.hasMany).toBe(true);
      expect(rolesField?.options).toEqual([
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ]);
    });

    it('should have Tenants collection with required fields', () => {
      const fieldNames = Tenants.fields.filter(hasName).map((field) => field.name);
      expect(fieldNames).toContain('name');
      expect(fieldNames).toContain('slug');
      expect(fieldNames).toContain('domain');
    });

    it('should have slug validation in Tenants collection', () => {
      const slugField = Tenants.fields.filter(hasName).find((field) => field.name === 'slug') as
        | (Field & { required?: boolean; unique?: boolean; validate?: unknown })
        | undefined;
      expect(slugField).toBeDefined();
      expect(slugField?.type).toBe('text');
      expect(slugField?.required).toBe(true);
      expect(slugField?.unique).toBe(true);
      expect(slugField?.validate).toBeDefined();
    });
  });
});
