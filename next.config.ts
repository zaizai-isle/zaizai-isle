import type { NextConfig } from "next";

const repoName = "zaizai-isle";

const nextConfig: NextConfig = {
  output: "export",
  basePath: `/${repoName}`,
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.metmuseum.org" },
      { protocol: "https", hostname: "www.artic.edu" },
      { protocol: "https", hostname: "openaccess-cdn.clevelandart.org" },
      { protocol: "https", hostname: "iip-thumb.smk.dk" },
      { protocol: "https", hostname: "api.smk.dk" },
      { protocol: "https", hostname: "www.loc.gov" },
      { protocol: "https", hostname: "tile.loc.gov" },
      { protocol: "https", hostname: "cdn.loc.gov" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "thumb.wikimedia.org" },
      { protocol: "https", hostname: "ids.si.edu" },
    ],
  },
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
};

export default nextConfig;
