import { withPayload } from '@payloadcms/next/withPayload';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Monorepo root where node_modules is located
const monorepoRoot = path.resolve(__dirname, '../..');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Set root to monorepo root so Turbopack can resolve packages from hoisted node_modules
  turbopack: {
    root: monorepoRoot,
  },

  // Ignore TypeScript errors in external packages
  typescript: {
    ignoreBuildErrors: true,
  },

  // Set to monorepo root for pnpm hoisted node_modules resolution
  outputFileTracingRoot: monorepoRoot,

  // Configure webpack to exclude parent directories
  webpack: (config, { isServer }) => {
    // Exclude root src directory from being scanned
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};

    // Prevent resolving @/ imports outside this package
    config.resolve.alias['@/'] = false;

    // Ensure we don't traverse up to parent directories
    config.watchOptions = config.watchOptions || {};
    config.watchOptions.ignored = [
      '**/node_modules/**',
      path.join(__dirname, '../../src/**'),
      path.join(__dirname, '../../packages/**'),
    ];

    return config;
  },
};

export default withPayload(nextConfig);
