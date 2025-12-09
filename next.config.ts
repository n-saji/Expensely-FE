import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["qidkhnousdwexgmgvytk.supabase.co"],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*", // all /api calls
        destination: process.env.NEXT_PUBLIC_API_URL + "/:path*", // redirect to Spring Boot locally
      },
    ];
  },
};

export default nextConfig;
