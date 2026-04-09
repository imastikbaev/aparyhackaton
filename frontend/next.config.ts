import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" нужен только для Docker-сборки.
  // На Vercel этот режим не нужен — Vercel сам управляет бандлом.
  ...(process.env.DOCKER_BUILD === "true" ? { output: "standalone" } : {}),
  experimental: {
    optimizePackageImports: ["zustand"],
  },
};

export default nextConfig;
