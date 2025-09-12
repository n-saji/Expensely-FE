"use client";
import { useRouter } from "next/navigation";
import Logo from "./logo";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import FetchToken from "@/utils/fetch_token";

export default function LandingPageNavBar() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  const [loggedIn, setLoggedIn] = useState(false);
  const token = FetchToken();

  useEffect(() => {
    if (user.isAuthenticated && token) {
      setLoggedIn(true);
    }
  }, [router]);

  return (
    <nav className="flex justify-between items-center px-6 py-4 shadow">
      <Logo
        className="text-xl sm:text-3xl font-bold text-green-600"
        dimension={{ width: 30, height: 30 }}
      />
      <div className="space-x-4">
        {loggedIn ? (
          <Link href="/dashboard" className="text-medium hover:underline">
            Dashboard
          </Link>
        ) : (
          <>
            <Link href="/login" className="text-medium hover:underline">
              Login
            </Link>
            <Link
              href="/register"
              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
