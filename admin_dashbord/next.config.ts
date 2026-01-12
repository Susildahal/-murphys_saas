import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["res.cloudinary.com"],
  },
  
  /* Proxy /api requests to backend to avoid CORS in production */
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        // expects NEXT_PUBLIC_API_URL without a trailing /api
        destination: `https://murphys-saas-l94u.vercel.app/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
