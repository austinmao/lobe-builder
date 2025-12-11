import { withPayload } from '@payloadcms/next/withPayload';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignore TypeScript errors in external packages
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withPayload(nextConfig);
