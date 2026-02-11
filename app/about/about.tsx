"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  FaLock,
  FaChartPie,
  FaPlusCircle,
  FaFileExport,
  FaBell,
} from "react-icons/fa";

export default function AboutPage() {
  const router = useRouter();
  return (
    <main className="bg-background text-foreground">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 right-0 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mx-auto max-w-6xl px-6 py-20 text-center"
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            About Expensely
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            A modern workspace for confident expense decisions.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Expensely keeps your team aligned on budgets, approvals, and spend
            visibility with a clean interface and instant insights.
          </p>
        </motion.div>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto max-w-6xl px-6 py-16"
      >
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Effortless tracking",
              description:
                "Log expenses, categorize spend, and keep every detail searchable.",
            },
            {
              title: "Clear reporting",
              description:
                "Live dashboards surface trends without manual spreadsheet work.",
            },
            {
              title: "Secure by design",
              description:
                "Role-based access and encryption keep sensitive data protected.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-muted/40"
      >
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Core capabilities
            </p>
            <h2 className="text-3xl font-semibold">
              Everything teams need to manage spend.
            </h2>
            <p className="max-w-2xl text-muted-foreground">
              Track expenses, monitor budgets, and export reports in minutes.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {[
              {
                icon: <FaPlusCircle size={24} />,
                title: "Capture spend",
              },
              {
                icon: <FaChartPie size={24} />,
                title: "Visual dashboards",
              },
              {
                icon: <FaFileExport size={24} />,
                title: "Export-ready",
              },
              {
                icon: <FaBell size={24} />,
                title: "Smart reminders",
              },
              {
                icon: <FaLock size={24} />,
                title: "Secure access",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col items-center gap-3 rounded-2xl border border-border/70 bg-card p-5 text-center"
              >
                <div className="rounded-full border border-border/70 bg-background p-3 text-emerald-600">
                  {feature.icon}
                </div>
                <p className="text-sm font-medium text-foreground">
                  {feature.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto max-w-6xl px-6 py-16"
      >
        <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              How it works
            </p>
            <h2 className="mt-4 text-3xl font-semibold">
              A simple flow from intake to insight.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Get set up quickly, sync your team, and unlock a clear view of
              every category without extra overhead.
            </p>
          </div>
          <ol className="space-y-4">
            {[
              "Create your workspace and invite stakeholders.",
              "Log expenses and map spend to categories.",
              "Review dashboards and approvals in real time.",
              "Export reports for finance and planning.",
            ].map((step, i) => (
              <li
                key={step}
                className="flex items-start gap-4 rounded-2xl border border-border/70 bg-card px-5 py-4"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-sm font-semibold text-white">
                  {i + 1}
                </span>
                <p className="text-sm text-foreground">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto max-w-4xl px-6 pb-16 text-center"
      >
        <h2 className="text-3xl font-semibold">Built with care.</h2>
        <p className="mt-4 text-muted-foreground">
          Expensely is crafted by{" "}
          <span
            className="font-semibold text-foreground underline cursor-pointer"
            onClick={() => {
              window.open("https://nikhilsaji.me");
            }}
          >
            Nikhil Saji
          </span>
          , focused on making expense management simple and stress-free for
          every team.
        </p>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto max-w-6xl px-6 pb-20 text-center"
      >
        <div className="rounded-3xl border border-border/70 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10 px-8 py-12">
          <h2 className="text-3xl font-semibold">
            Ready to run smarter budgets?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Launch your workspace in minutes and keep every approval on track.
          </p>
          <button
            className="mt-8 rounded-full bg-emerald-500 px-8 py-3 text-base font-semibold text-foreground shadow-sm transition hover:bg-emerald-600"
            onClick={() => router.push("/register")}
          >
            Get Started for Free
          </button>
        </div>
      </motion.section>
    </main>
  );
}
