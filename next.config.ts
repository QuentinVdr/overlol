import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  cacheMaxMemorySize: 50 * 1024 * 1024, // 50 MB
};

export default nextConfig;
