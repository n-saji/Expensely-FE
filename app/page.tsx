import React from "react";
import Link from "next/link";
import LandingPageNavBar from "@/components/landing-page-navbar";
import UserPreferences from "@/utils/userPreferences";
import { Button } from "@/components/ui/button";
import Hero3DCard from "@/components/3d/hero-3d-card";
import Hero3DBackground from "@/components/3d/hero-3d-background";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Globe,
  RefreshCw,
  Bell,
  UploadCloud,
  BookOpen,
  CheckCircle2,
  Zap,
} from "lucide-react";

export async function generateMetadata() {
  return {
    title: "Expensely | Enterprise Expense Tracking & Financial Intelligence",
    description:
      "Track expenses, manage budgets, automate recurring bills, and convert foreign currencies with Expensely's modern financial platform.",
  };
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-emerald-500/30 font-sans">
      <LandingPageNavBar />

      <main className="relative overflow-hidden">
        {/* Three.js 3D Background Particle Mesh */}
        <Hero3DBackground />

        {/* Hero Section */}
        <section className="relative z-10 mx-auto max-w-7xl px-6 pt-16 pb-20 sm:px-8 lg:pt-24 lg:pb-28">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 backdrop-blur-xl">
                <Sparkles className="h-4 w-4 animate-pulse" />
                Next-Gen Enterprise Financial Intelligence
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl leading-[1.1]">
                Financial Clarity at{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500">
                  Enterprise Scale
                </span>
              </h1>

              <p className="max-w-2xl mx-auto lg:mx-0 text-base sm:text-xl text-muted-foreground leading-relaxed font-normal">
                Expensely unifies real-time expense tracking, multi-currency conversions, category budget caps, and recurring bill automation in one sleek, luxury workspace.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="relative group rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-6 shadow-xl shadow-emerald-500/25 transition-all duration-300 hover:shadow-emerald-500/40 hover:scale-105"
                  >
                    <span className="flex items-center gap-2 text-base">
                      Start Free Trial
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Button>
                </Link>

                <Link href="/learn-more">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full border-border/80 bg-card/60 backdrop-blur-md px-8 py-6 font-semibold hover:bg-card hover:border-emerald-500/50 text-base"
                  >
                    <BookOpen className="h-5 w-5 mr-2 text-emerald-500" />
                    Platform Guide
                  </Button>
                </Link>
              </div>

              {/* Social Proof Badges */}
              <div className="pt-6 border-t border-border/40 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <p className="text-2xl font-black text-foreground">$10M+</p>
                  <p className="text-xs text-muted-foreground font-medium">Spend Tracked</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-emerald-500">99.9%</p>
                  <p className="text-xs text-muted-foreground font-medium">Uptime Guarantee</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-cyan-500">150+</p>
                  <p className="text-xs text-muted-foreground font-medium">Currencies Supported</p>
                </div>
              </div>
            </div>

            {/* Right Interactive 3D Card WebGL Container */}
            <div className="lg:col-span-5 relative">
              <Hero3DCard />
            </div>
          </div>
        </section>

        {/* MNC Stats Ticker Bar */}
        <section className="relative z-10 border-y border-border/50 bg-card/40 backdrop-blur-xl py-6">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 flex flex-wrap items-center justify-between gap-6 text-xs sm:text-sm font-semibold text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <span>Bank-Level Data Privacy</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              <span>Sub-Second Latency Sync</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-cyan-500" />
              <span>Live Multi-Currency Exchange</span>
            </div>
            <div className="flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-indigo-500" />
              <span>Cloud Document Backup</span>
            </div>
          </div>
        </section>

        {/* Feature Spotlight Grid */}
        <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 py-24 sm:px-8">
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Enterprise Feature Matrix
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
              Engineered for absolute financial authority.
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Everything you need to track spending, optimize cash flows, and manage subscriptions with total confidence.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <BarChart3 className="h-7 w-7 text-emerald-500" />,
                title: "Live Visual Analytics",
                description:
                  "Visualize monthly spend velocity, income breakdowns, and cashflow trends with interactive charts.",
                badge: "Analytics",
              },
              {
                icon: <TrendingUp className="h-7 w-7 text-teal-500" />,
                title: "Smart Budget Caps",
                description:
                  "Set category spending limits with live percentage progress bars and proactive over-spend alerts.",
                badge: "Core",
              },
              {
                icon: <Globe className="h-7 w-7 text-cyan-500" />,
                title: "Multi-Currency Exchange",
                description:
                  "Convert transactions seamlessly across 150+ foreign currencies using our live exchange rate engine.",
                badge: "Integrations",
              },
              {
                icon: <RefreshCw className="h-7 w-7 text-emerald-400" />,
                title: "Recurring Billing Engine",
                description:
                  "Automate recurring subscriptions, bill renewals, and monthly charges with custom cycles.",
                badge: "Automation",
              },
              {
                icon: <Bell className="h-7 w-7 text-amber-500" />,
                title: "Smart Bill Reminders",
                description:
                  "Receive dashboard alerts before bill due dates so you never incur late fees or missed payments.",
                badge: "Automation",
              },
              {
                icon: <UploadCloud className="h-7 w-7 text-indigo-500" />,
                title: "Digital Receipt Storage",
                description:
                  "Attach receipt photos and invoices directly to transactions with cloud storage and instant zoom previews.",
                badge: "Security",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group relative rounded-3xl border border-border/70 bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3.5 rounded-2xl bg-background border border-border/60 shadow-inner group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <span className="rounded-full border border-border/60 bg-background px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                    {feature.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-emerald-500 transition-colors">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Live Workspace Preview Showcase */}
        <section className="relative z-10 bg-card/30 border-y border-border/50 py-24">
          <div className="mx-auto max-w-7xl px-6 sm:px-8">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Interactive Workspace
                </div>
                <h2 className="text-3xl font-extrabold sm:text-4xl">
                  Designed for speed, clarity, and total control.
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Log transactions in seconds, track monthly caps, attach digital receipts, and switch between dark and light themes instantly.
                </p>
                <ul className="space-y-3 font-medium text-sm">
                  {[
                    "Instant key shortcuts for rapid transaction logging",
                    "Multi-tag filtering for trips, events, or tax deductions",
                    "Export transactions to CSV for accounting and tax reports",
                    "One-touch social sign-in and password protection",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Dynamic Mock UI Card */}
              <div className="lg:col-span-7">
                <div className="relative rounded-3xl border border-border/80 bg-card p-6 shadow-2xl backdrop-blur-xl">
                  <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-rose-500" />
                      <div className="h-3 w-3 rounded-full bg-amber-500" />
                      <div className="h-3 w-3 rounded-full bg-emerald-500" />
                      <span className="ml-2 text-xs font-mono text-muted-foreground">
                        expensely.app/dashboard
                      </span>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      LIVE DEMO
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3 mb-6">
                    <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Total Balance</p>
                      <p className="mt-2 text-2xl font-black text-foreground">$24,850.00</p>
                      <p className="text-xs text-emerald-500 font-semibold mt-1">↑ +14.2% this month</p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Monthly Spend</p>
                      <p className="mt-2 text-2xl font-black text-rose-500">$3,420.50</p>
                      <p className="text-xs text-muted-foreground font-semibold mt-1">Budget cap: $4,500</p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Budget Left</p>
                      <p className="mt-2 text-2xl font-black text-emerald-500">$1,079.50</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">24% remaining</p>
                    </div>
                  </div>

                  {/* Category Progress Meters */}
                  <div className="space-y-3 rounded-2xl border border-border/60 bg-background/50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category Cap Monitor</p>
                    {[
                      { name: "Housing & Rent", spend: "$1,800", cap: "$2,000", pct: "90%", color: "bg-amber-500" },
                      { name: "Groceries & Food", spend: "$640", cap: "$1,000", pct: "64%", color: "bg-emerald-500" },
                      { name: "Tech & Software", spend: "$420", cap: "$800", pct: "52.5%", color: "bg-cyan-500" },
                    ].map((row, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span>{row.name}</span>
                          <span>{row.spend} / {row.cap}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div className={`h-full rounded-full ${row.color}`} style={{ width: row.pct }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative z-10 mx-auto max-w-7xl px-6 py-24 sm:px-8 text-center">
          <div className="rounded-3xl border border-border/80 bg-card p-10 sm:p-16 shadow-xl">
            <h2 className="text-3xl font-extrabold sm:text-5xl">
              Elevate your expense management today.
            </h2>
            <p className="max-w-2xl mx-auto mt-4 text-muted-foreground text-sm sm:text-base">
              Set up your workspace in 30 seconds. No credit card required.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 shadow-lg shadow-emerald-500/30">
                  Create Free Account
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="rounded-full font-semibold px-8">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 py-10 bg-card/40 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Expensely. Crafted for excellence.</p>
          <div className="flex gap-6 font-medium">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/learn-more" className="hover:text-emerald-500 transition-colors">Platform Guide</Link>
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/login" className="hover:text-foreground transition-colors">Login</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Register</Link>
          </div>
        </div>
      </footer>

      <UserPreferences />
    </div>
  );
}
