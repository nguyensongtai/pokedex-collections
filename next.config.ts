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
    // A grid page requests up to 24 sprites at once, so cap the generated
    // widths: the cards never render larger than ~440px and every extra size
    // is another optimizer round trip against GitHub's CDN.
    imageSizes: [96, 160, 220, 320],
    deviceSizes: [640, 828, 1080],
  },
};

export default nextConfig;
