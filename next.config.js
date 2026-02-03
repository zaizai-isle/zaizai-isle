/** @type {import('next').NextConfig} */
const repoName = 'zaizai-isle';

const nextConfig = {
  output: 'export',
  basePath: `/${repoName}`,
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

module.exports = nextConfig;
