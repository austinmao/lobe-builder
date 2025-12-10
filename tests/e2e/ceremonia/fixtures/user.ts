/**
 * Test fixture: Ceremonia user credentials
 * Used for authentication in E2E tests
 */

export const ceremoniaUser = {
  email: 'admin@ceremoniacircle.org',
  password: 'ceremonia_secure_password_123',
  role: 'user' as const,
  tenantId: 'ceremonia',
};

export const otherTenantUser = {
  email: 'admin@other-tenant.com',
  password: 'other-password-123',
  role: 'user' as const,
  tenantId: 'other-tenant',
};
