import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required to prevent Node.js-only packages from bundling into Edge worker chunks
  serverExternalPackages: ["@libsql/client", "better-sqlite3"],
};

export default nextConfig;
