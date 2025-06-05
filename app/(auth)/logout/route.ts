
import { API_URL } from "@/config/config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (token) {
    try {
      const res = await fetch(`${API_URL}/users/logout`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("Logout API call failed:", await res.text());
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }

    // Optional: clear token cookie if you set it on login

  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.set("token", "", { maxAge: 0 }); // remove cookie
  return response;
}
