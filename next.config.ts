import type { NextConfig } from "next";

const UPSTREAM = "https://frontend-task-chatapp.onrender.com";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${UPSTREAM}/:path*`,
      },
    ];
  },
};

export default nextConfig;
