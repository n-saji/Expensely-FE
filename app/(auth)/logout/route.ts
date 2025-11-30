import api from "@/lib/api";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (token) {
    try {
      const res = await api.get(`/users/logout`);

      if (res.status !== 200) {
        console.error("Logout API call failed:", await res.data);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }

  // Optional: clear token cookie if you set it on login
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set("refreshToken", "", { maxAge: 0 }); // remove cookie
  response.cookies.set("accessToken", "", { maxAge: 0 }); // remove cookie

  return response;
}
