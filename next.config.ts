import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker 自部署时启用 standalone 模式
  output: process.env.DOCKER_BUILD === "true" ? "standalone" : undefined,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
