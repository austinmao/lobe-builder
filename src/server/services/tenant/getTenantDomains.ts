/**
 * Get Tenant Domains Service
 *
 * Fetches all verified tenant domains from the database with caching.
 * Returns a map of domain -> tenantSlug for middleware routing.
 *
 * @packageDocumentation
 */
import { pino } from '@/libs/logger';

/**
 * Cache configuration
 */
const DEFAULT_CACHE_TTL_MS = 60_000; // 60 seconds

/**
 * In-memory cache for tenant domains
 */
interface DomainCache {
  data: Record<string, string>;
  timestamp: number;
}

let domainCache: DomainCache | null = null;

/**
 * Get cache TTL from environment or use default
 */
function getCacheTTL(): number {
  const envTTL = process.env.TENANT_DOMAINS_CACHE_TTL_MS;
  if (envTTL) {
    const parsed = Number.parseInt(envTTL, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return DEFAULT_CACHE_TTL_MS;
}

/**
 * Check if cache is still valid
 */
function isCacheValid(cache: DomainCache | null): boolean {
  if (!cache) {
    return false;
  }

  const now = Date.now();
  const ttl = getCacheTTL();
  return now - cache.timestamp < ttl;
}

/**
 * Fetch tenant domains from database
 *
 * @returns Map of domain -> tenantSlug
 */
async function fetchDomainsFromDatabase(): Promise<Record<string, string>> {
  try {
    // Fetch all tenants with verified domains
    // Note: This would ideally use a dedicated repository method
    // For now, we'll return empty and log a warning
    // In production, add a `findAllVerifiedDomains()` method to TenantRepository

    pino.warn(
      'TenantRepository.findAllVerifiedDomains() not implemented - returning empty domain map',
    );

    // TODO: Implement TenantRepository.findAllVerifiedDomains() to query:
    // SELECT slug, domain FROM payload_tenants WHERE domainStatus = 'verified' AND domain IS NOT NULL

    return {};
  } catch (error) {
    pino.error({ error }, 'Failed to fetch tenant domains from database');
    return {};
  }
}

/**
 * Get tenant domains with caching
 *
 * Fetches all verified tenant domains from the database.
 * Returns a map of domain -> tenantSlug for middleware routing.
 *
 * Uses in-memory caching to avoid database hits on every request:
 * - Cache TTL: 60 seconds by default (configurable via TENANT_DOMAINS_CACHE_TTL_MS)
 * - On cache miss or expired: fetch from database
 * - Filters to only verified domains (domainStatus === 'verified')
 *
 * @returns Promise<Record<string, string>> - Map of domain -> tenantSlug
 *
 * @example
 * ```typescript
 * const domains = await getTenantDomains();
 * // Returns: { 'live.ceremoniacircle.org': 'ceremonia', ... }
 * ```
 */
export async function getTenantDomains(): Promise<Record<string, string>> {
  // Check cache first
  if (isCacheValid(domainCache)) {
    pino.trace('Serving tenant domains from cache');
    return domainCache!.data;
  }

  pino.debug('Cache miss or expired - fetching tenant domains from database');

  // Fetch from database
  const domains = await fetchDomainsFromDatabase();

  // Update cache
  domainCache = {
    data: domains,
    timestamp: Date.now(),
  };

  pino.info({ domainCount: Object.keys(domains).length }, 'Tenant domains cache updated');

  return domains;
}

/**
 * Invalidate the tenant domains cache
 *
 * Call this after adding, verifying, or removing a domain to force a refresh.
 *
 * @example
 * ```typescript
 * // After verifying a domain
 * await tenantRepository.update(tenantId, { domainStatus: 'verified' });
 * invalidateDomainCache();
 * ```
 */
export function invalidateDomainCache(): void {
  domainCache = null;
  pino.debug('Tenant domains cache invalidated');
}
