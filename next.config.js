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
  },
  // Prevent any tools from calling git during build
  webpack: (config, { isServer }) => {
    // Mock git command to prevent execution
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    return config;
  },
  env: {
    // Disable git in build process
    GIT_DIR: '/dev/null',
  },
};

module.exports = nextConfig;
