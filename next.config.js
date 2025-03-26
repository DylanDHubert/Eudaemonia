/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure proper transpiling for dependencies
  transpilePackages: ['react-chartjs-2', 'chart.js'],
  // Increase memory limit for builds if needed
  experimental: {
    memoryBasedWorkersCount: true
  },
  // Ensure CSS modules work properly
  webpack(config) {
    return config;
  }
};

module.exports = nextConfig; 