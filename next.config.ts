import type { NextConfig } from "next";

const UPSTREAM = "https://frontend-task-chatapp.onrender.com";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        source: "/backend/socket.io",
        destination: `${UPSTREAM}/socket.io/`,
      },
      {
        source: "/backend/socket.io/:path*",
        destination: `${UPSTREAM}/socket.io/:path*`,
      },
      {
        source: "/backend/:path*",
        destination: `${UPSTREAM}/:path*`,
      },
    ];
  },
};

export default nextConfig;
