import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ビルド時のESLintチェックを無視
  },
};

export default nextConfig;
