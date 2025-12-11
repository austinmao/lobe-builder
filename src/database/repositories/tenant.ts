/**
 * Tenant Repository for Payload CMS integration
 *
 * This repository provides database access for tenant records stored in Payload CMS.
 * It uses the Payload REST API to interact with the tenants collection.
 */
import { payloadEnv } from '@/envs/payload';

/**
 * Tenant record structure matching Payload CMS schema
 */
export interface TenantRecord {
  createdAt?: string;
  domain: string | null;
  domainStatus: 'pending_verification' | 'verified' | null;
  domainVerificationRecords: Array<{
    name: string;
    type: string;
    value: string;
  }> | null;
  id: string;
  name: string;
  slug: string;
  updatedAt?: string;
}

/**
 * Payload API response for tenant queries
 */
interface PayloadTenantsResponse {
  docs: TenantRecord[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
  nextPage: number | null;
  page: number;
  pagingCounter: number;
  prevPage: number | null;
  totalDocs: number;
  totalPages: number;
}

/**
 * Map Payload CMS tenant document to TenantRecord
 */
function mapPayloadTenant(doc: Record<string, unknown>): TenantRecord {
  return {
    createdAt: doc.createdAt ? String(doc.createdAt) : undefined,
    domain: doc.domain ? String(doc.domain) : null,
    domainStatus: doc.domainStatus as TenantRecord['domainStatus'],
    domainVerificationRecords:
      doc.domainVerificationRecords as TenantRecord['domainVerificationRecords'],
    id: String(doc.id),
    name: String(doc.name || ''),
    slug: String(doc.slug || ''),
    updatedAt: doc.updatedAt ? String(doc.updatedAt) : undefined,
  };
}

/**
 * Tenant repository for database operations via Payload REST API
 */
export class TenantRepository {
  private baseUrl: string;

  constructor() {
    this.baseUrl = payloadEnv.PAYLOAD_API_URL;
    if (!this.baseUrl) {
      console.warn('PAYLOAD_API_URL not configured, TenantRepository will not work');
    }
  }

  /**
   * Find tenant by ID
   *
   * @param id - Tenant ID
   * @returns Promise resolving to tenant record or null if not found
   */
  async findById(id: string): Promise<TenantRecord | null> {
    if (!this.baseUrl) {
      throw new Error('PAYLOAD_API_URL not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/tenants/${id}`);

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch tenant: ${response.status} ${response.statusText}`);
      }

      const doc = await response.json();
      return mapPayloadTenant(doc);
    } catch (error) {
      console.error('TenantRepository.findById error:', error);
      throw error;
    }
  }

  /**
   * Find tenant by slug
   *
   * @param slug - Tenant slug
   * @returns Promise resolving to tenant record or null if not found
   */
  async findBySlug(slug: string): Promise<TenantRecord | null> {
    if (!this.baseUrl) {
      throw new Error('PAYLOAD_API_URL not configured');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/api/tenants?where[slug][equals]=${encodeURIComponent(slug)}&limit=1`,
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch tenant: ${response.status} ${response.statusText}`);
      }

      const data: PayloadTenantsResponse = await response.json();

      if (data.docs && data.docs.length > 0) {
        return mapPayloadTenant(data.docs[0] as unknown as Record<string, unknown>);
      }

      return null;
    } catch (error) {
      console.error('TenantRepository.findBySlug error:', error);
      throw error;
    }
  }

  /**
   * Find tenant by domain
   *
   * @param domain - Domain name
   * @returns Promise resolving to tenant record or null if not found
   */
  async findByDomain(domain: string): Promise<TenantRecord | null> {
    if (!this.baseUrl) {
      throw new Error('PAYLOAD_API_URL not configured');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/api/tenants?where[domain][equals]=${encodeURIComponent(domain)}&limit=1`,
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch tenant: ${response.status} ${response.statusText}`);
      }

      const data: PayloadTenantsResponse = await response.json();

      if (data.docs && data.docs.length > 0) {
        return mapPayloadTenant(data.docs[0] as unknown as Record<string, unknown>);
      }

      return null;
    } catch (error) {
      console.error('TenantRepository.findByDomain error:', error);
      throw error;
    }
  }

  /**
   * Update tenant record
   *
   * @param id - Tenant ID
   * @param updates - Partial tenant record with fields to update
   * @returns Promise resolving to updated tenant record
   */
  async update(id: string, updates: Partial<TenantRecord>): Promise<TenantRecord> {
    if (!this.baseUrl) {
      throw new Error('PAYLOAD_API_URL not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/tenants/${id}`, {
        body: JSON.stringify(updates),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error(`Failed to update tenant: ${response.status} ${response.statusText}`);
      }

      const doc = await response.json();
      return mapPayloadTenant(doc);
    } catch (error) {
      console.error('TenantRepository.update error:', error);
      throw error;
    }
  }
}
