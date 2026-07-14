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
        source: "/api/incomes/:path*",
        destination: process.env.NEXT_PUBLIC_API_URL + "/incomes/:path*",
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
      {
        source: "/api/admins/:path*",
        destination: process.env.NEXT_PUBLIC_API_URL + "/admins/:path*",
      },
      {
        source: "/api/exchange-rates",
        destination: process.env.NEXT_PUBLIC_API_URL + "/exchange-rates",
      },
      {
        source: "/api/exchange-rates/:path*",
        destination: process.env.NEXT_PUBLIC_API_URL + "/exchange-rates/:path*",
      },
      {
        source: "/api/analytics/:path*",
        destination: process.env.NEXT_PUBLIC_API_URL + "/analytics/:path*",
      },
      {
        source: "/api/transactions/:path*",
        destination: process.env.NEXT_PUBLIC_API_URL + "/transactions/:path*",
      },
      {
        source: "/api/v1/reminders/:path*",
        destination: process.env.NEXT_PUBLIC_API_URL + "/v1/reminders/:path*",
      }
    ];
  },
};

export default nextConfig;