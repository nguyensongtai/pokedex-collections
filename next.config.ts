import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // PokeAPI serves official artwork from the sprites repo on GitHub.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/PokeAPI/sprites/**',
      },
    ],
  },
};

export default nextConfig;
