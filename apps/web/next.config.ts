import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@brxce/ui"],
  serverExternalPackages: ["@excalidraw/excalidraw"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "euhxmmiqfyptvsvvbbvp.supabase.co",
      },
    ],
  },
};

export default nextConfig;
