import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // ensures Turbopack uses this folder as the workspace root (silences "inferred workspace root" warning)
    root: '.',
  },
  images: {
    // `images.domains` is deprecated — prefer `remotePatterns` for more control
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  
  /* Proxy /api requests to backend to avoid CORS in production */
  // async rewrites() {
  //   return [
  //     {
  //       source: "/api/:path*",
  //       // expects NEXT_PUBLIC_API_URL without a trailing /api
  //       destination: `https://murphys-saas-l94u.vercel.app/api/:path*`,
  //     },
  //   ];
  // },
};

export default nextConfig;
