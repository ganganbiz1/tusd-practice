import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return {
      fallback: [
        {
          source: "/api/:path*",
          destination: "http://backend:8080/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
