/**
 * Domain validation utilities for Vercel integration
 *
 * This module provides domain format validation and availability checking
 * for the multi-tenant domain automation system.
 *
 * @packageDocumentation
 */

/**
 * Tenant repository interface for domain availability checks
 */
export interface TenantRepository {
  findByDomain(domain: string): Promise<{
    domain: string;
    id: string;
    slug: string;
  } | null>;
}

/**
 * Validate domain format
 *
 * Checks if a domain meets all validation criteria:
 * - Valid DNS format (RFC 1123)
 * - No protocol prefixes (http://, https://)
 * - No trailing slashes or paths
 * - Not localhost or internal domains
 * - Not reserved Vercel domains (.vercel.app, .vercel.dev, etc.)
 * - Maximum length limits (253 chars total, 63 per label)
 *
 * @param domain - Domain name to validate
 * @returns true if domain is valid, false otherwise
 *
 * @example
 * ```typescript
 * validateDomain('example.com'); // true
 * validateDomain('sub.example.com'); // true
 * validateDomain('http://example.com'); // false
 * validateDomain('localhost'); // false
 * validateDomain('app.vercel.app'); // false
 * ```
 */
export function validateDomain(domain: string): boolean {
  // Reject empty or whitespace-only strings
  if (!domain || !domain.trim()) {
    return false;
  }

  // Reject domains with leading or trailing whitespace
  if (domain !== domain.trim()) {
    return false;
  }

  const trimmed = domain.trim();

  // Reject domains with protocols
  if (/^[a-z]+:\/\//i.test(trimmed)) {
    return false;
  }

  // Reject domains with slashes, query strings, fragments, or ports
  if (/[#/:?]/.test(trimmed)) {
    return false;
  }

  // Reject domains with spaces
  if (/\s/.test(trimmed)) {
    return false;
  }

  // Maximum length check (253 characters total)
  if (trimmed.length > 253) {
    return false;
  }

  // Reject consecutive dots
  if (/\.\./.test(trimmed)) {
    return false;
  }

  // Reject localhost and localhost subdomains
  if (/^localhost$/i.test(trimmed) || /\.localhost$/i.test(trimmed)) {
    return false;
  }

  // Reject localhost.localdomain specifically
  if (/^localhost\.localdomain$/i.test(trimmed)) {
    return false;
  }

  // Reject .local domains
  if (/\.local$/i.test(trimmed)) {
    return false;
  }

  // Reject .test domains
  if (/\.test$/i.test(trimmed)) {
    return false;
  }

  // Reject reserved Vercel domains (case insensitive)
  const lowerDomain = trimmed.toLowerCase();
  if (
    lowerDomain.endsWith('.vercel.app') ||
    lowerDomain === 'vercel.app' ||
    lowerDomain.endsWith('.vercel.dev') ||
    lowerDomain === 'vercel.dev' ||
    lowerDomain.endsWith('.now.sh') ||
    lowerDomain === 'now.sh' ||
    lowerDomain.endsWith('.vercel.com') ||
    lowerDomain === 'vercel.com'
  ) {
    return false;
  }

  // Reject IP addresses (simple check for numeric TLDs and patterns)
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(trimmed)) {
    return false;
  }

  // Split into labels
  const labels = trimmed.split('.');

  // Must have at least two labels (domain + TLD)
  if (labels.length < 2) {
    return false;
  }

  // Validate each label
  for (const label of labels) {
    // Label cannot be empty
    if (label.length === 0) {
      return false;
    }

    // Label cannot exceed 63 characters
    if (label.length > 63) {
      return false;
    }

    // Label cannot start or end with hyphen
    if (label.startsWith('-') || label.endsWith('-')) {
      return false;
    }

    // Label must contain only alphanumeric characters and hyphens
    // Allow punycode (xn--) domains
    if (!/^[\da-z-]+$/i.test(label)) {
      return false;
    }
  }

  // TLD (last label) must not be all numeric
  const tld = labels.at(-1);
  if (!tld || /^\d+$/.test(tld)) {
    return false;
  }

  // TLD must not start with hyphen
  if (tld.startsWith('-')) {
    return false;
  }

  return true;
}

/**
 * Check if domain is available for use by a tenant
 *
 * Verifies that the domain is not already assigned to another tenant.
 * Allows the same domain for the same tenant (update scenario).
 *
 * @param domain - Domain name to check
 * @param tenantRepository - Repository for querying tenant data
 * @param tenantId - Optional tenant ID (for update checks)
 * @returns Promise resolving to true if domain is available, false if taken
 * @throws {Error} When database query fails
 *
 * @example
 * ```typescript
 * // Check if new domain is available
 * const available = await isDomainAvailable('new.example.com', repo);
 *
 * // Check if tenant can update their own domain
 * const canUpdate = await isDomainAvailable('existing.com', repo, 'tenant-123');
 * ```
 */
export async function isDomainAvailable(
  domain: string,
  tenantRepository: TenantRepository,
  tenantId?: string,
): Promise<boolean> {
  // Validate tenant repository is provided
  if (!tenantRepository) {
    throw new Error('Tenant repository is required');
  }

  // Normalize domain to lowercase and trim whitespace
  const normalizedDomain = domain.toLowerCase().trim();

  // Query database for existing domain
  const existingTenant = await tenantRepository.findByDomain(normalizedDomain);

  // Domain is available if not found
  if (!existingTenant) {
    return true;
  }

  // Domain is available if it belongs to the same tenant (update scenario)
  if (tenantId && existingTenant.id === tenantId) {
    return true;
  }

  // Domain is taken by another tenant
  return false;
}
