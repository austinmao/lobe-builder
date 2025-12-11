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
}

const getPayloadEnv = (): PayloadEnvConfig => {
  return {
    PAYLOAD_API_URL:
      process.env.PAYLOAD_API_URL ||
      (process.env.NODE_ENV === 'development' ? 'http://localhost:3011' : ''),
  };
};

export const payloadEnv = getPayloadEnv();
