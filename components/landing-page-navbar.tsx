"use client";
import { useRouter } from "next/navigation";
import Logo from "./logo";
import Link from "next/link";
import { useEffect, useState } from "react";
import validateToken from "@/utils/validate_token";

export default function LandingPageNavBar() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    validateToken().then((isValid) => {
      if (isValid) {
        setLoggedIn(true);
      } else {
        setLoggedIn(false);
      }
    });
  }, [router]);

  return (
    <nav className="flex justify-between items-center px-6 py-4 shadow">
      <Logo
        className="text-3xl font-bold text-green-600"
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
