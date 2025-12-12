/**
 * Domain Management tRPC Router
 *
 * This router provides endpoints for managing custom domains for tenants:
 * - Add custom domains to Vercel project
 * - Verify DNS configuration
 * - Remove domains
 *
 * @packageDocumentation
 */
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { TenantRepository } from '@/database/repositories/tenant';
import { authedProcedure, publicProcedure, router } from '@/libs/trpc/lambda';
import { VercelDomain } from '@/server/modules/VercelDomain';
import { validateDomain } from '@/server/modules/VercelDomain/validators';
import { invalidateDomainCache } from '@/server/services/tenant';

/**
 * Check if user has admin role for a specific tenant
 *
 * MVP Implementation: In the current MVP, we use a simplified permission model.
 * All authenticated users are considered admins for their tenant.
 *
 * Future Enhancement: When multi-tenant user management is implemented,
 * this function should check the user's role within the specific tenant
 * by querying the Payload CMS Users collection for the user's tenant relationships.
 *
 * @param ctx - tRPC context with user info
 * @param tenantId - Tenant ID to check permissions for (currently unused, for future use)
 * @returns true if user is authenticated (MVP: all authenticated users are admins)
 */
function hasAdminPermission(
  ctx: { userId?: string | null },
  tenantId: string, // eslint-disable-line @typescript-eslint/no-unused-vars
): boolean {
  // MVP: All authenticated users can manage domains for any tenant
  // This is acceptable for single-tenant-per-user scenarios
  // TODO: Implement proper tenant-role checking when multi-tenant user management is added
  return !!ctx.userId;
}

/**
 * Domain management router
 */
export const domainRouter = router({
  /**
   * Add a custom domain to a tenant
   *
   * Steps:
   * 1. Validate user has admin role for tenant
   * 2. Validate domain format
   * 3. Check domain not already in use by another tenant
   * 4. Call VercelDomain.addDomain()
   * 5. Update tenant record with domain, status='pending_verification', verificationRecords
   *
   * @throws {TRPCError} UNAUTHORIZED - Insufficient permissions
   * @throws {TRPCError} BAD_REQUEST - Invalid domain format
   * @throws {TRPCError} CONFLICT - Domain already in use
   * @throws {TRPCError} INTERNAL_SERVER_ERROR - Vercel API errors
   */
  add: authedProcedure
    .input(
      z.object({
        domain: z.string(),
        tenantId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { tenantId, domain } = input;

      // 1. Validate user has admin role for tenant
      if (!hasAdminPermission(ctx, tenantId)) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Insufficient permissions',
        });
      }

      // 2. Validate domain format
      if (!validateDomain(domain)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid domain format',
        });
      }

      // Initialize repository and Vercel client
      const tenantRepository = new TenantRepository();
      const vercelDomain = new VercelDomain();

      // 3. Check domain not already in use by another tenant
      const existingTenant = await tenantRepository.findByDomain(domain);
      if (existingTenant && existingTenant.id !== tenantId) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Domain already in use',
        });
      }

      try {
        // 4. Call VercelDomain.addDomain()
        const vercelResponse = await vercelDomain.addDomain(domain);

        // 5. Update tenant record with domain, status, and verification records
        const updatedTenant = await tenantRepository.update(tenantId, {
          domain: vercelResponse.domain,
          domainStatus: 'pending_verification',
          domainVerificationRecords: vercelResponse.verificationRecords || [],
        });

        // Invalidate domain cache so middleware picks up the change
        // (Note: domain won't be routed until verified, but cache is cleared for consistency)
        invalidateDomainCache();

        return {
          success: true,
          tenant: updatedTenant,
          verificationRecords: vercelResponse.verificationRecords || [],
        };
      } catch (error) {
        // Propagate Vercel API errors without modifying database
        if (error instanceof Error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message,
          });
        }
        throw error;
      }
    }),

  /**
   * Get tenant by slug
   *
   * This endpoint is used by the tenant settings page to fetch tenant data.
   * Uses publicProcedure because tenant data is publicly readable via Payload API.
   * Authentication is only required for domain management operations (add, verify, remove).
   */
  getTenant: publicProcedure
    .input(
      z.object({
        slug: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { slug } = input;

      const tenantRepository = new TenantRepository();

      try {
        const tenant = await tenantRepository.findBySlug(slug);

        if (!tenant) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Tenant not found',
          });
        }

        return {
          tenant,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch tenant',
        });
      }
    }),

  /**
   * Remove custom domain
   *
   * Steps:
   * 1. Validate admin permission
   * 2. Get tenant record
   * 3. If domain exists, call VercelDomain.removeDomain()
   * 4. Clear tenant domain, domainStatus, verificationRecords
   *
   * @throws {TRPCError} UNAUTHORIZED - Insufficient permissions
   * @throws {TRPCError} INTERNAL_SERVER_ERROR - Vercel API errors
   */
  remove: authedProcedure
    .input(
      z.object({
        tenantId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { tenantId } = input;

      // 1. Validate admin permission
      if (!hasAdminPermission(ctx, tenantId)) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Insufficient permissions',
        });
      }

      // Initialize repository and Vercel client
      const tenantRepository = new TenantRepository();
      const vercelDomain = new VercelDomain();

      // 2. Get tenant record
      const tenant = await tenantRepository.findById(tenantId);
      if (!tenant) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Tenant not found',
        });
      }

      // 3. If domain exists, call VercelDomain.removeDomain()
      if (tenant.domain) {
        try {
          await vercelDomain.removeDomain(tenant.domain);
        } catch (error) {
          // Propagate Vercel API errors
          if (error instanceof Error) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: error.message,
            });
          }
          throw error;
        }
      }

      // 4. Clear tenant domain, domainStatus, verificationRecords
      await tenantRepository.update(tenantId, {
        domain: null,
        domainStatus: null,
        domainVerificationRecords: null,
      });

      // Invalidate domain cache so middleware stops routing to this domain
      invalidateDomainCache();

      return {
        success: true,
        tenantId,
      };
    }),

  /**
   * Verify domain DNS configuration
   *
   * Steps:
   * 1. Get tenant record
   * 2. If no domain configured, throw error
   * 3. Call VercelDomain.verifyDomain()
   * 4. If verified: update status='verified', clear verificationRecords
   * 5. If pending: return pending status with records
   *
   * @throws {TRPCError} BAD_REQUEST - No domain configured for this tenant
   * @throws {TRPCError} INTERNAL_SERVER_ERROR - Vercel API errors
   */
  verify: authedProcedure
    .input(
      z.object({
        tenantId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { tenantId } = input;

      // Initialize repository and Vercel client
      const tenantRepository = new TenantRepository();
      const vercelDomain = new VercelDomain();

      // 1. Get tenant record
      const tenant = await tenantRepository.findById(tenantId);
      if (!tenant) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Tenant not found',
        });
      }

      // 2. If no domain configured, throw error
      if (!tenant.domain) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No domain configured for this tenant',
        });
      }

      try {
        // 3. Call VercelDomain.verifyDomain()
        const verificationResult = await vercelDomain.verifyDomain(tenant.domain);

        // 4. If verified: update status='verified', clear verificationRecords
        if (verificationResult.verified) {
          await tenantRepository.update(tenantId, {
            domainStatus: 'verified',
            domainVerificationRecords: null,
          });

          // Invalidate domain cache so middleware routes to this domain
          invalidateDomainCache();

          return {
            domain: verificationResult.domain,
            verified: true,
          };
        }

        // 5. If pending: return pending status with records (no database update)
        return {
          domain: verificationResult.domain,
          pendingRecords: verificationResult.pendingRecords || [],
          verified: false,
        };
      } catch (error) {
        // Propagate Vercel API errors
        if (error instanceof Error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message,
          });
        }
        throw error;
      }
    }),
});

export type DomainRouter = typeof domainRouter;
