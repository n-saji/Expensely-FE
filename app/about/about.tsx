"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/dist/client/components/navigation";
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
    <main className="max-w-7xl mx-auto px-6 py-16 space-y-20">
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          <span className="text-green-600">Discover Expensely</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
          Effortless, secure, and beautiful expense tracking to help you stay on
          top of your finances.
        </p>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2
          className="text-2xl md:text-3xl font-semibold text-center mb-8
        dark:text-gray-200"
        >
          Why Use Expensely?
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            "Effortless expense tracking",
            "Custom categories & tags",
            "Beautiful analytics & charts",
            "Budget planning & reminders",
            "Export anytime",
            "Data privacy & encryption",
          ].map((text, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.05 }}
            >
              <BenefitCard text={text} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2
          className="text-2xl md:text-3xl font-semibold text-center mb-8
        dark:text-gray-200"
        >
          Key Features
        </h2>
        <div className="grid md:grid-cols-5 gap-6">
          {[
            {
              icon: <FaPlusCircle size={28} color="green" />,
              title: "Add Expenses & Income",
            },
            {
              icon: <FaChartPie size={28} color="green" />,
              title: "Visual Dashboards",
            },
            {
              icon: <FaFileExport size={28} color="green" />,
              title: "Export to CSV",
            },
            { icon: <FaBell size={28} color="green" />, title: "Reminders" },
            {
              icon: <FaLock size={28} color="green" />,
              title: "Data Security",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.05 }}
            >
              <FeatureCard icon={feature.icon} title={feature.title} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-3xl mx-auto"
      >
        <h2
          className="text-2xl md:text-3xl font-semibold text-center mb-8
        dark:text-gray-200"
        >
          How It Works
        </h2>
        <ol className="space-y-4 text-gray-700 dark:text-gray-300 text-lg">
          {[
            "Sign up securely in seconds.",
            "Add your expenses and income effortlessly.",
            "Explore dashboards & discover spending trends.",
            "Plan budgets and receive helpful reminders.",
          ].map((step, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.1 }}
              className="flex items-start"
            >
              <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                {i + 1}
              </span>
              {step}
            </motion.li>
          ))}
        </ol>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center max-w-2xl mx-auto"
      >
        <h2
          className="text-2xl md:text-3xl font-semibold mb-4
        dark:text-gray-200"
        >
          About the Creator
        </h2>
        <p
          className="text-gray-700 text-lg
        dark:text-gray-300"
        >
          Built by{" "}
          <span
            className="font-semibold dark:text-gray-100 underline cursor-pointer"
            onClick={() => {
              window.open("https://nikhilsaji.me");
            }}
          >
            Nikhil Saji
          </span>
          , a passionate developer who believes expense tracking should be
          simple, intuitive, and stress-free.
        </p>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center"
      >
        <button
          className="button-green px-8 py-4 rounded-full text-lg font-semibold shadow hover:shadow-lg transition"
          onClick={() => router.push("/register")}
        >
          Get Started for Free
        </button>
      </motion.section>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex flex-col items-center p-4 bg-white border border-gray-100 rounded-2xl shadow hover:shadow-md transition">
      <div className="text-blue-600 mb-2">{icon}</div>
      <p className="text-gray-800 text-center text-sm font-medium">{title}</p>
    </div>
  );
}

function BenefitCard({ text }: { text: string }) {
  return (
    <div className="p-4 bg-gray-50 rounded-2xl shadow hover:shadow-md transition text-center text-gray-800 font-medium">
      {text}
    </div>
  );
}
