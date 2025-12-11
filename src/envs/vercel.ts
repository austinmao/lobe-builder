/**
 * Vercel API Configuration
 *
 * Environment variables for Vercel Domains API integration.
 * Used for automated custom domain provisioning in multi-tenant SaaS.
 */

interface VercelEnvConfig {
  /**
   * Vercel API token for authentication
   * @see https://vercel.com/account/tokens
   */
  VERCEL_API_TOKEN: string;

  /**
   * Vercel project ID where domains will be added
   * @example 'prj_abc123xyz'
   */
  VERCEL_PROJECT_ID: string;

  /**
   * Vercel team ID (optional, for team accounts)
   * @example 'team_abc123xyz'
   */
  VERCEL_TEAM_ID?: string;
}

const getVercelEnv = (): VercelEnvConfig => {
  return {
    VERCEL_API_TOKEN: process.env.VERCEL_API_TOKEN || '',
    VERCEL_PROJECT_ID: process.env.VERCEL_PROJECT_ID || '',
    VERCEL_TEAM_ID: process.env.VERCEL_TEAM_ID,
  };
};

export const vercelEnv = getVercelEnv();
