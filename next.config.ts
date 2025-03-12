import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/factorio-qrcode-maker' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/factorio-qrcode-maker/' : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
