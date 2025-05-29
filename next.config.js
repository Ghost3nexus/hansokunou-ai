/** @type {import('next').NextConfig} */
const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const repoName = 'hansokunou-ai';

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  basePath: isGitHubPages ? `/${repoName}` : '',
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  distDir: process.env.DIST_DIR || '.next',
  exportPathMap: async function (defaultPathMap, { dev, dir, outDir, distDir, buildId }) {
    const filteredPathMap = {};
    for (const [path, config] of Object.entries(defaultPathMap)) {
      if (!path.startsWith('/api/')) {
        filteredPathMap[path] = config;
      }
    }
    return filteredPathMap;
  },
};

module.exports = nextConfig;
