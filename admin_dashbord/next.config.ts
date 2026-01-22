import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Disable strict mode to suppress findDOMNode warnings from react-quill
  turbopack: {
    root: '.',
  },
  images: {
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
