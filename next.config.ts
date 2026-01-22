import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/zaizai-isle",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
