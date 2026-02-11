import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude native modules from serverless bundling (local dev only)
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
