import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // Do not use basePath when building for Capacitor native apps
  basePath: process.env.CAPACITOR_BUILD === '1' ? undefined : '/po-tiramisu',
  images: {
    // Enable image optimization for web; Capacitor builds use static export
    unoptimized: process.env.CAPACITOR_BUILD === '1',
    formats: ['image/avif', 'image/webp'],
  },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
