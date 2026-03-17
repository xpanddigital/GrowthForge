/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Increase timeout for static page generation during build
    staticPageGenerationTimeout: 120,
  },
};

export default nextConfig;
