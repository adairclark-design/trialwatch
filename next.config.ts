import type { NextConfig } from "next";

const nextConfig = {
  // Required to prevent Node.js-only packages from bundling into Edge worker chunks
  serverExternalPackages: ["@libsql/client", "better-sqlite3"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
