import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@brxce/ui"],
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
