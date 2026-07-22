"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LandingPageNavBar from "@/components/landing-page-navbar";
import { Button } from "@/components/ui/button";
import {
  FaLock,
  FaChartPie,
  FaPlusCircle,
  FaFileExport,
  FaBell,
} from "react-icons/fa";
import { BookOpen, Sparkles } from "lucide-react";

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-emerald-500/30 font-sans">
      <LandingPageNavBar />

      <main className="relative overflow-hidden">
        {/* Glow Spheres */}
        <div className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />

        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-6 py-20 text-center sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              About Expensely
            </p>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl max-w-4xl mx-auto">
              A modern enterprise workspace for confident financial decisions.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              Expensely aligns individuals and teams on budgets, approvals, recurring expenses, and live spend visibility with zero manual overhead.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/learn-more">
                <Button className="rounded-full bg-emerald-600 hover:bg-emerald-500 font-semibold px-6 shadow-lg shadow-emerald-500/20">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Explore Platform Guide
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Value Pillars */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-7xl px-6 py-12 sm:px-8"
        >
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Effortless Spend Tracking",
                description:
                  "Log transactions in seconds, categorize spend with custom tags, and keep every digital receipt searchable in secure cloud storage.",
              },
              {
                title: "Live Intelligent Reporting",
                description:
                  "Interactive dashboards surface spend velocity, net profit margins, and monthly budget progress automatically.",
              },
              {
                title: "Bank-Grade Encryption",
                description:
                  "Bank-level data encryption, protected account access, and password confirmation ensure total privacy.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-border/70 bg-card p-8 shadow-sm transition-all hover:border-emerald-500/40 hover:-translate-y-1"
              >
                <h3 className="text-xl font-bold text-foreground">{item.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Core Capabilities */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-card/40 border-y border-border/50 py-16"
        >
          <div className="mx-auto max-w-7xl px-6 sm:px-8">
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-xs uppercase tracking-[0.3em] font-semibold text-emerald-600 dark:text-emerald-400">
                Platform Capabilities
              </p>
              <h2 className="text-3xl font-extrabold sm:text-4xl">
                Everything you need to master money management.
              </h2>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { icon: <FaPlusCircle size={22} />, title: "Instant Logging" },
                { icon: <FaChartPie size={22} />, title: "Live Analytics" },
                { icon: <FaFileExport size={22} />, title: "CSV Reports" },
                { icon: <FaBell size={22} />, title: "Smart Reminders" },
                { icon: <FaLock size={22} />, title: "Bank-Level Security" },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="flex flex-col items-center gap-4 rounded-3xl border border-border/60 bg-card p-6 text-center shadow-sm"
                >
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-600 dark:text-emerald-400">
                    {feature.icon}
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    {feature.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Author & Mission */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl px-6 py-16 text-center sm:px-8"
        >
          <h2 className="text-3xl font-extrabold tracking-tight">Engineered for Perfection.</h2>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            Expensely was designed and developed by{" "}
            <span
              className="font-bold text-foreground underline decoration-emerald-500 cursor-pointer hover:text-emerald-500 transition-colors"
              onClick={() => {
                window.open("https://nikhilsaji.me");
              }}
            >
              Nikhil Saji
            </span>
            , focused on delivering luxury financial software, sub-second latency, and intuitive clarity for every user.
          </p>
        </motion.section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-7xl px-6 pb-20 sm:px-8 text-center"
        >
          <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-card to-cyan-500/10 px-8 py-12 shadow-xl">
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Take full control of your spend today.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-sm sm:text-base">
              Create your account in seconds and unlock real-time financial freedom.
            </p>
            <Button
              size="lg"
              className="mt-8 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 shadow-lg shadow-emerald-500/25"
              onClick={() => router.push("/register")}
            >
              Get Started for Free
            </Button>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
