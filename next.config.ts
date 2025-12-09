import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["qidkhnousdwexgmgvytk.supabase.co"],
  },
  async rewrites() {
    return [
      {
        source: "/api/users/:path*", 
        destination: process.env.NEXT_PUBLIC_API_URL + "/users/:path*", 
      },
      {
        source: "/api/budgets/:path*", 
        destination: process.env.NEXT_PUBLIC_API_URL + "/budgets/:path*", 
      },
      {        source: "/api/categories/:path*", 
        destination: process.env.NEXT_PUBLIC_API_URL + "/categories/:path*", 
      },
      {        source: "/api/expenses/:path*", 
        destination: process.env.NEXT_PUBLIC_API_URL + "/expenses/:path*", 
      },
    ];
  },
};

export default nextConfig;
