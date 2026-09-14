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
    // A grid page requests up to 24 sprites at once, so keep the generated
    // width set small: cards never render larger than ~440px, and every extra
    // candidate width is another optimizer round trip against GitHub's CDN.
    imageSizes: [96, 160, 220, 320],
    deviceSizes: [640, 828, 1080],
    // GitHub's sprite URLs are immutable, so cache aggressively and avoid
    // re-fetching upstream on every request.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
