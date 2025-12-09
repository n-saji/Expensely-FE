import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["qidkhnousdwexgmgvytk.supabase.co"],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*", 
        destination: process.env.NEXT_PUBLIC_API_URL + "/:path*", 
      },
    ];
  },
};

export default nextConfig;
