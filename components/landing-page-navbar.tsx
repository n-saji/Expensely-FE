"use client";
import Logo from "./logo";
import Link from "next/link";
import { useEffect, useState } from "react";
import validateToken from "@/utils/validate_token";
import { Button } from "./ui/button";

export default function LandingPageNavBar() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    let active = true;

    validateToken()
      .then((isValid) => {
        if (!active) {
          return;
        }
        setLoggedIn(isValid);
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setLoggedIn(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <nav className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo
          className="text-xl sm:text-3xl font-bold"
          dimension={{ width: 30, height: 30 }}
        />
        <div className="flex items-center gap-3">
          {loggedIn ? (
            <Link href="/dashboard" className="text-medium hover:underline">
              <Button variant={"ghost"}>Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-medium hover:underline">
                <Button variant={"ghost"}>Login</Button>
              </Link>
              <Link href="/register" className="px-2 py-2 rounded-md text-sm">
                <Button>Start Free</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
