import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/po-tiramisu',
  images: {
    unoptimized: true,
  },
  /* config options here */
};

export default nextConfig;
