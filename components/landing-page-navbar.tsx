"use client";

import Logo from "./logo";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import validateToken from "@/utils/validate_token";
import { Button } from "./ui/button";
import { Sparkles, ArrowRight, BookOpen } from "lucide-react";

export default function LandingPageNavBar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let active = true;

    validateToken()
      .then((isValid) => {
        if (!active) return;
        setLoggedIn(isValid);
      })
      .catch(() => {
        if (!active) return;
        setLoggedIn(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Platform Guide", href: "/learn-more", icon: <BookOpen className="h-4 w-4" /> },
    { label: "About Us", href: "/about" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl transition-all duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5 sm:px-8">
        <Link href="/" className="flex items-center gap-3 group">
          <Logo
            className="text-xl sm:text-2xl font-extrabold tracking-tight transition-transform group-hover:scale-105"
            dimension={{ width: 32, height: 32 }}
          />
        </Link>

        {/* Navigation Links with Active Page Highlighting */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 transition-all py-1 border-b-2 ${
                  isActive
                    ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/60"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 sm:gap-4">
          {loggedIn ? (
            <Link href="/dashboard">
              <Button className="relative group overflow-hidden rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 px-5">
                <span className="flex items-center gap-2 font-semibold">
                  Dashboard
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="rounded-full text-sm font-medium hover:bg-muted"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="relative group rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold shadow-lg shadow-emerald-500/25 px-5 transition-all duration-200 hover:shadow-emerald-500/40">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" />
                    Get Started
                  </span>
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
