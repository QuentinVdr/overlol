import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  cacheMaxMemorySize: 50 * 1024 * 1024, // 50 MB
  images: {
    remotePatterns: [new URL('https://ddragon.leagueoflegends.com/cdn/**/img/champion/**.png')],
  },
};

export default nextConfig;
