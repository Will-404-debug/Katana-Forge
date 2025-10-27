/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  outputFileTracingExcludes: [
    '**/.next/cache/**',
    '**/.git/**',
  ],
};

module.exports = nextConfig;
