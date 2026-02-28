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
      {
        source: "/api/categories/:path*",
        destination: process.env.NEXT_PUBLIC_API_URL + "/categories/:path*",
      },
      {
        source: "/api/expenses/:path*",
        destination: process.env.NEXT_PUBLIC_API_URL + "/expenses/:path*",
      },
      {
        source: "/api/recurring-expenses/:path*",
        destination:
          process.env.NEXT_PUBLIC_API_URL + "/recurring-expenses/:path*",
      },
      {
        source: "/api/web_sockets/:path*",
        destination: process.env.NEXT_PUBLIC_API_URL + "/web_sockets/:path*",
      },
    ];
  },
};

export default nextConfig;
