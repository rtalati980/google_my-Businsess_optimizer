import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Image optimization
  images: {
    unoptimized: false,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Compression
  compress: true,

  // Redirects for trailing slashes
  trailingSlash: false,

  // Headers for security
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), camera=()",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Rewrites for API proxying
  async rewrites() {
    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    // Avoid IPv6 resolution issues locally by forcing 127.0.0.1 for local backend
    const apiDest = rawApiUrl.includes("localhost") || rawApiUrl.includes("127.0.0.1")
      ? "http://127.0.0.1:8080"
      : rawApiUrl;

    return {
      beforeFiles: [
        {
          source: "/api/:path*",
          destination: `${apiDest}/api/:path*`,
        },
        {
          source: "/oauth2/:path*",
          destination: `${apiDest}/oauth2/:path*`,
        },
      ],
    };
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  },

  // Turbopack configuration for Next.js 16
  turbopack: {
    resolveAlias: {
      "@": "./",
    },
  },
};

export default nextConfig;
