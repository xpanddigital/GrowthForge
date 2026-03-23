/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Increase timeout for static page generation during build
    staticPageGenerationTimeout: 120,
  },
  // Mark apify-client and its transitive deps as external so Vercel's
  // serverless bundler doesn't try to tree-shake them (which drops proxy-agent).
  serverExternalPackages: ["apify-client", "proxy-agent"],
};

export default nextConfig;
