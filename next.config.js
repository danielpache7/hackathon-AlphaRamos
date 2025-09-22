/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Optimize images
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Compress responses
  compress: true,
  
  // Enable experimental features for better performance
  experimental: {
    // Enable modern bundling
    esmExternals: true,
  },
  
  // Environment variables that should be available on the client side
  env: {
    CUSTOM_KEY: 'hackathon-voting-system',
  },
  
  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig