import LandingPageNavBar from "@/components/landing-page-navbar";
import { Button } from "@/components/ui/button";
import UserPreferences from "@/utils/userPreferences";
import Link from "next/link";

export default async function Home() {


  return (
    <div className="min-h-screen bg-background">
      <LandingPageNavBar />

      {/* Hero Section */}
      <section className="text-center px-6 py-20 bg-primary/10">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          Track your expenses effortlessly 💰
        </h1>
        <p className="text-lg text-gray-600 mb-6 max-w-xl mx-auto">
          Expensely helps you manage and visualize your spending. Set budgets,
          generate reports, and take control of your money.
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/register">
            <Button>Get Started</Button>
          </Link>
          <Link href="/about">
            <Button variant={"ghost"}>Learn More</Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-primary/0">
        <div className="grid sm:grid-cols-3 gap-8 text-center max-w-5xl mx-auto">
          <div>
            <h3 className="text-xl font-semibold mb-2">💼 Budgeting</h3>
            <p className="text-gray-600">
              Plan and track your monthly budgets with ease.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">📊 Reports</h3>
            <p className="text-gray-600">
              Visualize your spending with dynamic charts and graphs.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">🔒 Secure</h3>
            <p className="text-gray-600">
              All your data is encrypted and safe with us.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-12 px-6 bg-primary/10">
        <h2 className="text-3xl font-bold mb-4">
          Start managing your money smarter today.
        </h2>
        <Link href="/register">
          <Button>Create Free Account</Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm py-6 bg-primary/0">
        © 2025 Expensely · Privacy Policy · Contact
      </footer>
      <UserPreferences />
    </div>
  );
}
