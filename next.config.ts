import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ENSURE PROPER TRANSPILING FOR DEPENDENCIES
  transpilePackages: ['react-chartjs-2', 'chart.js'],
  // INCREASE MEMORY LIMIT FOR BUILDS IF NEEDED
  experimental: {
    memoryBasedWorkersCount: true
  },
  // ENSURE CSS MODULES WORK PROPERLY
  webpack(config) {
    return config;
  }
};

export default nextConfig;
