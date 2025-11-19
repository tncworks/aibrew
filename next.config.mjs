/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  
  // 環境変数
  env: {
    NEXT_PUBLIC_ENVIRONMENT: process.env.ENVIRONMENT || 'dev',
  },

  // Cloud Run向けの設定
  experimental: {
    serverActions: {
      allowedOrigins: ['*.run.app'],
    },
  },
}

export default nextConfig
