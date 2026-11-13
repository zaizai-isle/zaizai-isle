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
  // 固定 buildId：JS/CSS chunk 文件名本身就是内容哈希；固定 buildId 让
  // _buildManifest/_ssgManifest 的 URL 不再每次部署都变（Next 默认是 nanoid 随机，删掉不等于稳定）。
  // 配合 GitHub Pages 的 max-age=600，未变更的资源可在 10 分钟内命中缓存。
  generateBuildId: async () => "v1",
};

export default nextConfig;
