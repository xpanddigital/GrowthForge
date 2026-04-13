/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Mark apify-client and its transitive deps as external so Vercel's
    // serverless bundler doesn't try to tree-shake them (which drops proxy-agent).
    serverComponentsExternalPackages: ["apify-client", "proxy-agent"],
  },
};

export default nextConfig;
