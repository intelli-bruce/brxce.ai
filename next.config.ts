import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
