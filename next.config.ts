import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  cacheComponents: true,
  cacheMaxMemorySize: 50 * 1024 * 1024, // 50 MB
};

export default nextConfig;
