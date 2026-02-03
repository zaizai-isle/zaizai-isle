/** @type {import('next').NextConfig} */
const repoName = 'zaizai-isle';

const nextConfig = {
  output: 'export',
  basePath: `/${repoName}`,
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Disable git usage for build ID to prevent "git failed with exit code 128" in CI
  generateBuildId: async () => {
    return 'build-' + Date.now();
  }
};

module.exports = nextConfig;
