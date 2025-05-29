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
};

module.exports = nextConfig;
