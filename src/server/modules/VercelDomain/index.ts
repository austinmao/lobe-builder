/**
 * VercelDomain - Integration module for Vercel Domains API
 *
 * This module provides automated domain management for multi-tenant SaaS:
 * - Add custom domains to Vercel project
 * - Verify DNS configuration
 * - Remove domains
 * - List all configured domains
 *
 * @packageDocumentation
 */
import { vercelEnv as vercelEnvModule } from '@/envs/vercel';

// Allow mocking in tests - wrapped in object to make it spyable
export const envHelpers = {
  getVercelEnv: () => vercelEnvModule,
};

/**
 * Verification record returned by Vercel API
 */
export interface VerificationRecord {
  name: string;
  type: string;
  value: string;
}

/**
 * Response from adding a domain
 */
export interface AddDomainResponse {
  domain: string;
  success: boolean;
  verificationRecords?: VerificationRecord[];
  verified: boolean;
}

/**
 * Response from verifying a domain
 */
export interface VerifyDomainResponse {
  domain: string;
  pendingRecords?: VerificationRecord[];
  verified: boolean;
}

/**
 * Domain information from Vercel API
 */
export interface DomainInfo {
  gitBranch?: string | null;
  name: string;
  redirect?: string | null;
  verification: any[];
  verified: boolean;
}

/**
 * Response from listing domains
 */
export interface ListDomainsResponse {
  domains: DomainInfo[];
  pagination: {
    count: number;
    next: string | null;
    prev: string | null;
  };
}

/**
 * VercelDomain class - Manages Vercel Domains API integration
 */
export class VercelDomain {
  private readonly apiToken: string;
  private readonly projectId: string;
  private readonly teamId?: string;
  private readonly baseUrl = 'https://api.vercel.com';

  /**
   * Initialize Vercel Domain API client
   *
   * @throws {Error} When required environment variables are missing
   */
  constructor() {
    const vercelEnv = envHelpers.getVercelEnv();

    if (!vercelEnv.VERCEL_API_TOKEN) {
      throw new Error('VERCEL_API_TOKEN is required');
    }

    if (!vercelEnv.VERCEL_PROJECT_ID) {
      throw new Error('VERCEL_PROJECT_ID is required');
    }

    this.apiToken = vercelEnv.VERCEL_API_TOKEN;
    this.projectId = vercelEnv.VERCEL_PROJECT_ID;
    this.teamId = vercelEnv.VERCEL_TEAM_ID;
  }

  /**
   * Build URL with optional team ID query parameter
   */
  private buildUrl(path: string): string {
    const url = `${this.baseUrl}${path}`;
    if (this.teamId) {
      return `${url}?teamId=${this.teamId}`;
    }
    return url;
  }

  /**
   * Get common headers for Vercel API requests
   */
  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Handle error responses from Vercel API
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    const message = errorData.error?.message || 'Unknown error';

    // Map specific status codes to user-friendly messages
    switch (response.status) {
      case 409: {
        throw new Error('Domain already exists');
      }
      case 400: {
        throw new Error('Invalid domain format');
      }
      case 429: {
        throw new Error('Rate limit exceeded');
      }
      case 403: {
        throw new Error('Insufficient permissions');
      }
      case 401: {
        // Check if it's specifically for removeDomain (check error message)
        if (message.includes('Invalid API token')) {
          throw new Error('Invalid API token');
        }
        throw new Error('Invalid or expired API token');
      }
      case 404: {
        throw new Error('Domain not found');
      }
      default: {
        throw new Error(message);
      }
    }
  }

  /**
   * Add a domain to the Vercel project
   *
   * @param domain - Domain name to add (e.g., "ceremonia.example.com")
   * @returns Promise resolving to add domain response with verification records
   * @throws {Error} When domain already exists, invalid format, rate limited, or network error
   */
  async addDomain(domain: string): Promise<AddDomainResponse> {
    const url = this.buildUrl(`/v10/projects/${this.projectId}/domains`);

    const response = await fetch(url, {
      body: JSON.stringify({ name: domain }),
      headers: this.getHeaders(),
      method: 'POST',
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    const data = await response.json();

    // Handle case where verification array may be empty or undefined
    // (e.g., when domain is already verified)
    const verificationRecords = Array.isArray(data.verification)
      ? data.verification.map((record: any) => ({
          name: record.domain,
          type: record.type,
          value: record.value,
        }))
      : [];

    return {
      domain: data.name,
      success: true,
      verificationRecords,
      verified: data.verified,
    };
  }

  /**
   * Verify domain DNS configuration
   *
   * @param domain - Domain name to verify
   * @returns Promise resolving to verification status
   * @throws {Error} When domain not found or network error
   */
  async verifyDomain(domain: string): Promise<VerifyDomainResponse> {
    const url = this.buildUrl(`/v9/projects/${this.projectId}/domains/${domain}`);

    const response = await fetch(url, {
      headers: this.getHeaders(),
      method: 'GET',
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    const data = await response.json();

    if (data.verified) {
      return {
        domain: data.name,
        verified: true,
      };
    }

    // Handle case where verification array may be empty or undefined
    const pendingRecords = Array.isArray(data.verification)
      ? data.verification.map((record: any) => ({
          name: record.domain,
          type: record.type,
          value: record.value,
        }))
      : [];

    return {
      domain: data.name,
      pendingRecords,
      verified: false,
    };
  }

  /**
   * Remove a domain from the Vercel project
   *
   * @param domain - Domain name to remove
   * @returns Promise resolving when domain is removed
   * @throws {Error} When insufficient permissions or network error (404 is handled gracefully)
   */
  async removeDomain(domain: string): Promise<void> {
    const url = this.buildUrl(`/v9/projects/${this.projectId}/domains/${domain}`);

    const response = await fetch(url, {
      headers: this.getHeaders(),
      method: 'DELETE',
    });

    // 204 = success, 404 = already removed (idempotent)
    if (response.ok || response.status === 204) {
      return;
    }

    // 404 should not throw (idempotent operation)
    if (response.status === 404) {
      return;
    }

    // All other errors should throw
    await this.handleErrorResponse(response);
  }

  /**
   * Get domain information
   *
   * @param domain - Domain name to retrieve
   * @returns Promise resolving to domain information
   * @throws {Error} When domain not found
   */
  async getDomain(domain: string): Promise<DomainInfo> {
    const url = this.buildUrl(`/v9/projects/${this.projectId}/domains/${domain}`);

    const response = await fetch(url, {
      headers: this.getHeaders(),
      method: 'GET',
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    return response.json();
  }

  /**
   * List all domains in the project
   *
   * @returns Promise resolving to list of domains with pagination
   */
  async listDomains(): Promise<ListDomainsResponse> {
    const url = this.buildUrl(`/v9/projects/${this.projectId}/domains`);

    const response = await fetch(url, {
      headers: this.getHeaders(),
      method: 'GET',
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    return response.json();
  }
}
