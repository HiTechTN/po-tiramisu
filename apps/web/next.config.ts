import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // Do not use basePath when building for Capacitor native apps
  basePath: process.env.CAPACITOR_BUILD === '1' ? undefined : '/po-tiramisu',
  images: {
    unoptimized: true,
  },
  /* config options here */
};

export default nextConfig;
