"use client";
import Logo from "@/components/logo";
import validateToken from "@/utils/validate_token";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    validateToken().then((isValid) => {
      if (isValid) {
        setLoggedIn(true);
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 py-4 shadow">
        <Logo
          className="text-2xl font-bold text-green-600"
          dimension={{ width: 30, height: 30 }}
        />
        <div className="space-x-4">
          {loggedIn ? (
            <Link href="/dashboard" className="text-sm hover:underline">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm hover:underline">
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

      {/* Hero Section */}
      <section className="text-center px-6 py-20 bg-gray-50">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          Track your expenses effortlessly 💰
        </h1>
        <p className="text-lg text-gray-600 mb-6 max-w-xl mx-auto">
          Expensely helps you manage and visualize your spending. Set budgets,
          generate reports, and take control of your money.
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/register">
            <button className="button-green">Get Started</button>
          </Link>
          <Link href="/about">
            <button className="button-green-outline">
              Learn More
            </button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-white">
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
      <section className="bg-green-600 text-white text-center py-12 px-6">
        <h2 className="text-3xl font-bold mb-4">
          Start managing your money smarter today.
        </h2>
        <Link href="/register">
          <button className="button-white">
            Create Free Account
          </button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm py-6 text-gray-500 bg-gray-50">
        © 2025 Expensely · Privacy Policy · Contact
      </footer>
    </div>
  );
}
