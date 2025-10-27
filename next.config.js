/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  outputFileTracingIgnores: [
    '**/.next/cache/**',
    '**/.git/**',
  ],
};

module.exports = nextConfig;
