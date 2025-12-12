/**
 * Payload CMS API Configuration
 *
 * Environment variables for Payload CMS REST API integration.
 * Used for tenant management and domain automation.
 */

interface PayloadEnvConfig {
  /**
   * Payload CMS API base URL
   * @example 'http://localhost:3011' for local dev
   * @example 'https://payload.example.com' for production
   */
  PAYLOAD_API_URL: string;

  /**
   * Service secret for service-to-service authentication
   * Required for write operations on Tenants collection from the main app
   * Must match PAYLOAD_SERVICE_SECRET on the Payload server
   * @example 'your-service-secret-here'
   */
  PAYLOAD_SERVICE_SECRET: string | undefined;
}

const getPayloadEnv = (): PayloadEnvConfig => {
  return {
    PAYLOAD_API_URL:
      process.env.PAYLOAD_API_URL ||
      (process.env.NODE_ENV === 'development' ? 'http://localhost:3011' : ''),
    PAYLOAD_SERVICE_SECRET: process.env.PAYLOAD_SERVICE_SECRET,
  };
};

export const payloadEnv = getPayloadEnv();
