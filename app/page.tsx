import LandingPageNavBar from "@/components/landing-page-navbar";
import { Button } from "@/components/ui/button";
import UserPreferences from "@/utils/userPreferences";
import Link from "next/link";

export default async function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingPageNavBar />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -top-32 right-0 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Expensely - Track and Manage Your Expenses
              </p>
              <h1 className="mt-6 text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                Track your expenses effortlessly 💰
              </h1>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground">
                Expensely helps you manage and visualize your spending. Set
                budgets, generate reports, and take control of your money.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link href="/register">
                  <Button className="px-6">Get Started</Button>
                </Link>
                <Link href="/about">
                  <Button variant={"outline"} className="px-6">
                    Learn More
                  </Button>
                </Link>
              </div>
              <div className="mt-10 grid grid-cols-2 gap-6 text-sm text-muted-foreground sm:grid-cols-3">
                <div>
                  <p className="text-2xl font-semibold text-foreground">💼</p>
                  <p>Plan budgets with ease</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">📊</p>
                  <p>Visualize your spending</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">🔒</p>
                  <p>Encrypted and secure</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-emerald-500/15 via-transparent to-cyan-500/15" />
              <div className="relative rounded-[32px] border border-border/70 bg-card/90 p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      Monthly Summary
                    </p>
                    <p className="mt-2 text-2xl font-semibold">$1,240.42</p>
                    <p className="text-sm text-muted-foreground">
                      Total spending
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-right">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Budget left
                    </p>
                    <p className="mt-2 text-lg font-semibold text-emerald-600">
                      $320
                    </p>
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  {[
                    { label: "Groceries", value: "$320", width: "w-[72%]" },
                    { label: "Transport", value: "$180", width: "w-[52%]" },
                    { label: "Subscriptions", value: "$90", width: "w-[36%]" },
                  ].map((row) => (
                    <div key={row.label} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {row.label}
                        </span>
                        <span className="font-medium text-foreground">
                          {row.value}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className={`h-2 rounded-full bg-emerald-500 ${row.width}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-2xl border border-border/60 bg-background/60 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Next review
                  </p>
                  <p className="mt-2 text-sm text-foreground">
                    Budget check in 2 days
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "💼 Budgeting",
                description: "Plan and track your monthly budgets with ease.",
              },
              {
                title: "📊 Reports",
                description:
                  "Visualize your spending with dynamic charts and graphs.",
              },
              {
                title: "🔒 Secure",
                description: "All your data is encrypted and safe with us.",
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
        </section>

        {/* Workflow */}
        <section className="bg-muted/40">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[0.9fr_1.1fr] md:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                How it helps
              </p>
              <h2 className="mt-4 text-3xl font-semibold">
                Start managing your money smarter today.
              </h2>
              <p className="mt-4 text-muted-foreground">
                Track expenses in seconds, stay on budget, and see exactly where
                your money goes with clean dashboards.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "Track expenses fast",
                  description:
                    "Log expenses in seconds with a clean, distraction-free interface",
                },
                {
                  title: "Set monthly budgets",
                  description:
                    "Stay in control with smart spending limits that keep you on track",
                },
                {
                  title: "Get spending insights",
                  description:
                    "Understand your spending patterns with detailed analytics",
                },
                {
                  title: "Export your reports",
                  description:
                    "Generate professional reports for tax or business purposes",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border/70 bg-card p-5"
                >
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="rounded-3xl border border-border/70 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10 px-8 py-12 text-center">
            <h2 className="text-3xl font-semibold">
              Start managing your money smarter today.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Expensely makes it easy to track, budget, and understand your
              expenses in one place.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/register">
                <Button className="px-6">Create Free Account</Button>
              </Link>
              <Link href="/about">
                <Button variant={"outline"} className="px-6">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/70 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2025 Expensely. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-foreground">
              About
            </Link>
            <Link href="/login" className="hover:text-foreground">
              Login
            </Link>
            <Link href="/register" className="hover:text-foreground">
              Register
            </Link>
          </div>
        </div>
      </footer>
      <UserPreferences />
    </div>
  );
}
