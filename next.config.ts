import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ═══════════════════════════════════════════
  // TYPESCRIPT — Ignore Build Errors
  // ═══════════════════════════════════════════
  typescript: {
    ignoreBuildErrors: true,
  },

  // ═══════════════════════════════════════════
  // IMAGES
  // ═══════════════════════════════════════════
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;