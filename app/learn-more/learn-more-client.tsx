"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import LandingPageNavBar from "@/components/landing-page-navbar";
import { Button } from "@/components/ui/button";
import {
  Search,
  BookOpen,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Layers,
  ShieldCheck,
  Zap,
  DollarSign,
  TrendingUp,
  BarChart3,
  Lock,
  RefreshCw,
  Bell,
  Sliders,
  Globe,
  UploadCloud,
  FileSpreadsheet,
  Calendar,
  Users,
  Award,
} from "lucide-react";

interface FeatureEntry {
  letter: string;
  title: string;
  category: "Core" | "Analytics" | "Automation" | "Security" | "Integrations";
  tagline: string;
  description: string;
  highlights: string[];
  icon: React.ReactNode;
  routeLink?: string;
}

const FEATURE_GUIDE_DATA: FeatureEntry[] = [
  {
    letter: "A",
    title: "Analytics & Spend Intelligence",
    category: "Analytics",
    tagline: "Real-time spend breakdowns and interactive category charts.",
    description:
      "Expensely automatically aggregates your transaction history into real-time visual breakdown graphs and income vs. expense cashflow summaries.",
    highlights: [
      "Dynamic category pie & bar charts",
      "Net profit and cash flow balance metrics",
      "Instant multi-range filtering",
    ],
    icon: <BarChart3 className="h-6 w-6 text-emerald-500" />,
    routeLink: "/dashboard",
  },
  {
    letter: "B",
    title: "Budget Caps & Over-spend Alerts",
    category: "Core",
    tagline: "Set monthly spending limits and get notified before exceeding caps.",
    description:
      "Define granular spending budgets per category (Groceries, Tech, Dining out). Expensely calculates remaining balance percentage and triggers visual warnings when approaching limit thresholds.",
    highlights: [
      "Category-specific spending thresholds",
      "Color-coded visual progress indicators",
      "Proactive threshold breach alerts",
    ],
    icon: <TrendingUp className="h-6 w-6 text-teal-500" />,
    routeLink: "/budget",
  },
  {
    letter: "C",
    title: "Category Customization & Icons",
    category: "Core",
    tagline: "Tailor custom income and expense categories with color tags.",
    description:
      "Full flexibility to create, edit, or delete custom categories. Map expenses or income sources with vibrant color palettes and descriptive icons to keep your ledger organized.",
    highlights: [
      "Custom Income and Expense classification",
      "Personalized color badges & icons",
      "Automated expense sorting rules",
    ],
    icon: <Sliders className="h-6 w-6 text-cyan-500" />,
    routeLink: "/category",
  },
  {
    letter: "D",
    title: "Dynamic Real-Time Dashboards",
    category: "Core",
    tagline: "Centralized command center for your entire financial life.",
    description:
      "Monitor total net worth, recent activity feeds, monthly expense velocity, and category allocations in a responsive dark/light mode dashboard designed for ultra-fast navigation.",
    highlights: [
      "Live balance updates",
      "High-density overview cards",
      "Seamless dark & light mode support",
    ],
    icon: <Layers className="h-6 w-6 text-blue-500" />,
    routeLink: "/dashboard",
  },
  {
    letter: "E",
    title: "Exchange Rates & Multi-Currency",
    category: "Integrations",
    tagline: "Live foreign exchange rate conversion engine.",
    description:
      "Convert transactions across USD, EUR, GBP, INR, JPY, and 150+ global currencies using our live exchange rate service. Perfect for international travel and cross-border teams.",
    highlights: [
      "Real-time currency converter tool",
      "Automated rate fetching service",
      "Multi-currency spend display",
    ],
    icon: <Globe className="h-6 w-6 text-emerald-400" />,
    routeLink: "/exchange-rate",
  },
  {
    letter: "F",
    title: "Fast One-Click Expense Logging",
    category: "Core",
    tagline: "Capture transaction details in under 5 seconds.",
    description:
      "An optimized transaction form equipped with receipt file attachments, automatic category matching, and instant state sync to eliminate manual bookkeeping friction.",
    highlights: [
      "Rapid modal input form",
      "Auto-fill category defaults",
      "Instant state updates",
    ],
    icon: <Zap className="h-6 w-6 text-amber-500" />,
    routeLink: "/transaction",
  },
  {
    letter: "G",
    title: "Global Cloud Encryption & Security",
    category: "Security",
    tagline: "Bank-grade encryption and privacy controls.",
    description:
      "Your financial data is protected with bank-level encryption standards, protected authorization guards, and security protocols to prevent unauthorized access.",
    highlights: [
      "Bank-grade payload encryption",
      "Protected token authentication",
      "Password confirmation for sensitive actions",
    ],
    icon: <ShieldCheck className="h-6 w-6 text-emerald-600" />,
  },
  {
    letter: "H",
    title: "Historical Spending Trends",
    category: "Analytics",
    tagline: "Compare month-over-month performance and growth.",
    description:
      "Analyze historical spending spikes across months and quarters. Identify seasonal spending patterns and adjust your financial trajectory with confidence.",
    highlights: [
      "Month-over-month comparison",
      "Historical spend archives",
      "Trend forecasting",
    ],
    icon: <BarChart3 className="h-6 w-6 text-indigo-500" />,
  },
  {
    letter: "I",
    title: "Income Stream Management",
    category: "Core",
    tagline: "Track salary, freelance payouts, and investment returns.",
    description:
      "Log recurring and one-off income deposits separate from expenses to calculate accurate net savings rates and disposable income margins.",
    highlights: [
      "Multi-source income tracking",
      "Net revenue calculations",
      "Savings rate metrics",
    ],
    icon: <DollarSign className="h-6 w-6 text-emerald-500" />,
  },
  {
    letter: "J",
    title: "Journal Attachments & Digital Receipts",
    category: "Core",
    tagline: "Store digital receipt images directly with transactions.",
    description:
      "Attach invoice files or receipt photos to any transaction record. Uploaded documents are securely stored in the cloud with instant photo previews.",
    highlights: [
      "Cloud digital receipt storage",
      "Instant photo preview drawer",
      "Audit-ready digital records",
    ],
    icon: <UploadCloud className="h-6 w-6 text-cyan-600" />,
  },
  {
    letter: "K",
    title: "Key Performance Indicators (KPIs)",
    category: "Analytics",
    tagline: "Top-line executive financial summary metrics.",
    description:
      "Glanceable KPI cards highlight your highest spending category, top monthly merchant, total net savings, and days remaining in the current budget cycle.",
    highlights: [
      "At-a-glance financial summary cards",
      "Highest expense highlights",
      "Budget cycle countdowns",
    ],
    icon: <Award className="h-6 w-6 text-amber-500" />,
  },
  {
    letter: "L",
    title: "Live Social Single Sign-On",
    category: "Security",
    tagline: "One-touch login with Google, GitHub, and social accounts.",
    description:
      "Sign in securely with one tap using social provider integration. Link existing accounts to your Expensely profile for seamless cross-device login.",
    highlights: [
      "One-click social authentication",
      "Account linking & unlinking options",
      "Seamless login security",
    ],
    icon: <Lock className="h-6 w-6 text-teal-600" />,
  },
  {
    letter: "M",
    title: "Multi-Device Responsive Interface",
    category: "Core",
    tagline: "Optimized experience across Mobile, Tablet, and Workstation.",
    description:
      "Crafted with fluid design patterns, Expensely provides a native-quality experience whether on a mobile phone, tablet, or desktop workstation.",
    highlights: [
      "Mobile-first gesture navigation",
      "Responsive data tables",
      "High-resolution display scaling",
    ],
    icon: <Layers className="h-6 w-6 text-indigo-400" />,
  },
  {
    letter: "N",
    title: "Notification & Due-Date Reminders",
    category: "Automation",
    tagline: "Never miss a bill payment or subscription renewal again.",
    description:
      "Set custom date reminders for utility bills, credit card statements, and rent payments. Receive visual dashboard alerts before payments become overdue.",
    highlights: [
      "Custom bill due date tracking",
      "Pending vs. Completed status filters",
      "Proactive dashboard alerts",
    ],
    icon: <Bell className="h-6 w-6 text-rose-500" />,
    routeLink: "/reminder",
  },
  {
    letter: "O",
    title: "Operational Administrative Controls",
    category: "Security",
    tagline: "System-wide administrative telemetry and user oversight.",
    description:
      "Role-based authorization grants administrators global visibility over platform performance metrics, registered user volume, and security audits.",
    highlights: [
      "Role-based access permissions",
      "System health telemetry",
      "Administrative user controls",
    ],
    icon: <Users className="h-6 w-6 text-purple-500" />,
    routeLink: "/admin",
  },
  {
    letter: "P",
    title: "Profile & Avatar Customization",
    category: "Core",
    tagline: "Customize profile details, cloud avatars, and preferences.",
    description:
      "Upload profile pictures to cloud storage, manage contact details, change security credentials with password verification, or toggle theme preferences.",
    highlights: [
      "Cloud profile photo storage",
      "Password-verified account changes",
      "Theme & currency defaults",
    ],
    icon: <Users className="h-6 w-6 text-emerald-500" />,
    routeLink: "/profile",
  },
  {
    letter: "Q",
    title: "Quick Search & Smart Filtering",
    category: "Core",
    tagline: "Instant multi-field transaction search and date scoping.",
    description:
      "Find any payment record instantly by typing keywords, merchant names, tags, date ranges, or exact amounts in our search filter bar.",
    highlights: [
      "Sub-millisecond query results",
      "Custom date range selection",
      "Multi-tag search capabilities",
    ],
    icon: <Search className="h-6 w-6 text-cyan-500" />,
    routeLink: "/transaction",
  },
  {
    letter: "R",
    title: "Recurring Subscription Tracker",
    category: "Automation",
    tagline: "Automate daily, weekly, monthly, and annual expense billing.",
    description:
      "Track recurring subscriptions (streaming, software, gym, bills) effortlessly. Expensely automatically forecasts upcoming charges and updates monthly budgets.",
    highlights: [
      "Flexible recurring cycles (Daily/Monthly/Yearly)",
      "Active vs. Paused subscription toggles",
      "Automated forecast projections",
    ],
    icon: <RefreshCw className="h-6 w-6 text-emerald-500" />,
    routeLink: "/recurring-expense",
  },
  {
    letter: "S",
    title: "Secure Cloud File Vault",
    category: "Integrations",
    tagline: "High-speed document storage for receipt attachments.",
    description:
      "Profile photos and receipt documents are saved to secure cloud file storage with fast delivery and high-resolution document viewing.",
    highlights: [
      "Direct cloud upload pipeline",
      "Fast cached document delivery",
      "Secure encrypted file links",
    ],
    icon: <UploadCloud className="h-6 w-6 text-teal-500" />,
  },
  {
    letter: "T",
    title: "Transaction Tagging & Grouping",
    category: "Core",
    tagline: "Group expenses by project tags, trips, or tax deductibles.",
    description:
      "Assign custom labels (e.g., #Vacation, #TaxDeductible, #OfficeSetup) to group related transactions across different spend categories for easy reporting.",
    highlights: [
      "Multi-tag transaction grouping",
      "Filter transactions by custom label",
      "Project & event budget tracking",
    ],
    icon: <Sliders className="h-6 w-6 text-blue-500" />,
    routeLink: "/transaction",
  },
  {
    letter: "U",
    title: "User Preference Controls",
    category: "Core",
    tagline: "Persist custom themes, table views, and default settings.",
    description:
      "Tailor your workspace settings to your liking. Expensely automatically remembers your active workspace preferences, currency selection, and theme settings.",
    highlights: [
      "Persisted user preference state",
      "Dark / Light / System auto-theme",
      "Customizable default dashboard view",
    ],
    icon: <Sliders className="h-6 w-6 text-indigo-500" />,
    routeLink: "/settings",
  },
  {
    letter: "V",
    title: "Visual Financial Reports",
    category: "Analytics",
    tagline: "Beautiful interactive charts for personal financial reporting.",
    description:
      "Transform raw financial numbers into clear visual stories. Render responsive category charts, breakdown bar graphs, and cashflow trend lines.",
    highlights: [
      "Interactive chart tooltips",
      "Smooth visual transitions",
      "Exportable financial views",
    ],
    icon: <BarChart3 className="h-6 w-6 text-emerald-500" />,
  },
  {
    letter: "W",
    title: "Wallet & Account Balances",
    category: "Core",
    tagline: "Track multiple cash accounts, cards, and balances.",
    description:
      "Maintain clear boundaries between cash, savings accounts, credit cards, and business ledgers to monitor total liquidity in real time.",
    highlights: [
      "Multi-account ledger organization",
      "Real-time cash balance tracking",
      "Unified net worth overview",
    ],
    icon: <DollarSign className="h-6 w-6 text-cyan-500" />,
  },
  {
    letter: "X",
    title: "Export & Report Downloads",
    category: "Analytics",
    tagline: "Download spreadsheet reports for tax and accounting.",
    description:
      "Generate formatted transaction logs and monthly expenditure reports ready for tax season, bookkeepers, or personal financial archives.",
    highlights: [
      "One-click spreadsheet exporting",
      "Filtered report date windows",
      "Formatted data layout",
    ],
    icon: <FileSpreadsheet className="h-6 w-6 text-emerald-600" />,
  },
  {
    letter: "Y",
    title: "Yearly Spend Summaries",
    category: "Analytics",
    tagline: "Annual budget summaries and tax preparation.",
    description:
      "Review annual spending totals grouped by category to evaluate year-long financial health, savings ratios, and tax-deductible expense totals.",
    highlights: [
      "Annual spending aggregation",
      "Tax deductible categorization",
      "Multi-year financial comparison",
    ],
    icon: <Calendar className="h-6 w-6 text-purple-500" />,
  },
  {
    letter: "Z",
    title: "Zero-Downtime Account Security",
    category: "Security",
    tagline: "Strict token verification and password-protected deletion.",
    description:
      "Built with security-first standards. All user requests are verified through secure authentication tokens, session handlers, and mandatory password checks for account deletion.",
    highlights: [
      "Session verification guards",
      "Password confirmation modal protection",
      "Secure backend token verification",
    ],
    icon: <ShieldCheck className="h-6 w-6 text-emerald-500" />,
  },
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function LearnMoreClient() {
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const filteredFeatures = useMemo(() => {
    return FEATURE_GUIDE_DATA.filter((feat) => {
      const matchesLetter = selectedLetter ? feat.letter === selectedLetter : true;
      const matchesCategory =
        selectedCategory === "All" ? true : feat.category === selectedCategory;
      const matchesQuery =
        searchQuery.trim() === ""
          ? true
          : feat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            feat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            feat.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
            feat.letter.toLowerCase() === searchQuery.trim().toLowerCase();

      return matchesLetter && matchesCategory && matchesQuery;
    });
  }, [selectedLetter, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-emerald-500/30 font-sans">
      <LandingPageNavBar />

      <main className="relative">
        {/* Glow background */}
        <div className="pointer-events-none absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="pointer-events-none absolute top-1/3 left-10 h-80 w-80 rounded-full bg-cyan-500/10 blur-[100px]" />

        {/* Hero Header */}
        <section className="relative pt-16 pb-12 px-6 sm:px-8 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 backdrop-blur-md">
              <BookOpen className="h-3.5 w-3.5" />
              Platform & Feature Guide
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl max-w-4xl mx-auto">
              Everything You Can Do with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500">Expensely</span>
            </h1>
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground">
              Discover every tool, spending feature, and automation built into Expensely to help you manage your money effortlessly.
            </p>
          </motion.div>

          {/* Search & Category Filter Bar */}
          <div className="mt-10 max-w-3xl mx-auto space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search capabilities (e.g., Budgets, Multi-Currency, Receipts, Reminders)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-border/80 bg-card/80 py-4 pl-12 pr-4 text-sm font-medium shadow-lg backdrop-blur-md outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium">
              {["All", "Core", "Analytics", "Automation", "Security", "Integrations"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-2 transition-all ${
                    selectedCategory === cat
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                      : "bg-card border border-border/60 text-muted-foreground hover:border-emerald-500/50 hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Letter Filter Ribbon */}
        <section className="sticky top-[65px] z-40 bg-background/80 backdrop-blur-xl border-y border-border/50 py-3 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => setSelectedLetter(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  selectedLetter === null
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "bg-card hover:bg-muted text-muted-foreground"
                }`}
              >
                ALL
              </button>
              {ALPHABET.map((char) => {
                const hasFeature = FEATURE_GUIDE_DATA.some((f) => f.letter === char);
                const isSelected = selectedLetter === char;
                return (
                  <button
                    key={char}
                    disabled={!hasFeature}
                    onClick={() => setSelectedLetter(isSelected ? null : char)}
                    className={`h-8 w-8 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/30 scale-110"
                        : hasFeature
                        ? "bg-card border border-border/60 text-foreground hover:border-emerald-500 hover:text-emerald-500"
                        : "opacity-30 cursor-not-allowed bg-muted text-muted-foreground"
                    }`}
                  >
                    {char}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
          {filteredFeatures.length === 0 ? (
            <div className="text-center py-16 rounded-3xl border border-dashed border-border/80 bg-card/40 p-8">
              <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold">No capabilities found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your search query or filter settings.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSelectedLetter(null);
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filteredFeatures.map((feature) => (
                  <motion.div
                    key={feature.letter + feature.title}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="group relative flex flex-col justify-between rounded-3xl border border-border/70 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10"
                  >
                    {/* Top Header */}
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-xl border border-emerald-500/20">
                            {feature.letter}
                          </span>
                          <span className="rounded-full border border-border/60 bg-background px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                            {feature.category}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-2xl bg-background border border-border/60">
                          {feature.icon}
                        </div>
                      </div>

                      <h3 className="text-lg font-bold tracking-tight text-foreground group-hover:text-emerald-500 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {feature.tagline}
                      </p>
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>

                      {/* Bullet Highlights */}
                      <ul className="mt-4 space-y-2 border-t border-border/50 pt-4">
                        {feature.highlights.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-xs font-medium text-foreground/80">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Link */}
                    {feature.routeLink && (
                      <div className="mt-6 pt-4 border-t border-border/40">
                        <Link href={feature.routeLink}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-between rounded-xl hover:bg-emerald-500/10 hover:text-emerald-500 text-xs font-semibold"
                          >
                            <span>Try Feature</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* CTA Banner */}
        <section className="max-w-7xl mx-auto px-6 sm:px-8 pb-20">
          <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-card to-background p-8 sm:p-12 text-center shadow-2xl">
            <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Ready to experience modern financial management?
            </h2>
            <p className="max-w-2xl mx-auto mt-4 text-muted-foreground text-sm sm:text-base">
              Join thousands of smart individuals and teams managing their money with Expensely.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 shadow-lg shadow-emerald-500/30">
                  Get Started Free
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
      <footer className="border-t border-border/50 py-8 bg-card/50 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Expensely Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <Link href="/learn-more" className="hover:text-foreground">Platform Guide</Link>
            <Link href="/about" className="hover:text-foreground">About</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
