/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack is now default for dev, no config needed
  experimental: {
    // Optimize modular imports specifically for large icon libraries
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

module.exports = nextConfig;