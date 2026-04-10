/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverExternalPackages: ['typeorm', 'better-sqlite3'],
  },
};

export default nextConfig;
