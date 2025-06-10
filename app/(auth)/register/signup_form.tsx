"use client";

import { API_URL } from "@/config/config";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    if (
      !name ||
      !email ||
      !countryCode ||
      !phone ||
      !password ||
      !confirmPassword
    ) {
      setError("All fields are required");
      return;
    }

    if (!/^[a-zA-Z\s]+$/.test(name)) {
      setError("Name can only contain letters and spaces");
      return;
    }

    if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
      setError("Invalid email format");
      return;
    }

    if (!/^\+\d{1,3}$/.test(countryCode)) {
      setError("Invalid country code format");
      return;
    }

    if (!/^\d+$/.test(phone) || phone.length < 10) {
      setError("Phone number must be at least 10 digits long");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    await fetch(`${API_URL}/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        country_code: countryCode,
        phone,
        password,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          setError("Failed to sign up");
          return;
        }
        setLoading(false);
        setName("");
        setEmail("");
        setCountryCode("+1");
        setPhone("");
        setPassword("");
        setConfirmPassword("");
        setError("");
        router.push("/login");
      })
      .catch((err) => {
        console.error("Error during signup:", err);
        setError("An error occurred during signup. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <form className="space-y-5 w-full">
      {/* name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Name
        </label>
        <input
          id="name"
          type="text"
          placeholder="Enter your name"
          required
          className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            name && error === "" ? "border-red-500" : ""
          }`}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
        />
      </div>
      {/* email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          required
          className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            email && error === "" ? "border-red-500" : ""
          }`}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
        />
      </div>

      {/* phone */}
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Phone
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={countryCode}
            className="mt-1 block w-1/5 border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => {
              setCountryCode(e.target.value);
              setError("");
            }}
          ></input>
          <input
            id="phone"
            type="tel"
            placeholder="Enter your phone number"
            required
            className={`mt-1 block w-4/5 border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              phone && error === "" ? "border-red-500" : ""
            }
              ${phone.length < 10 && error ? "border-red-500" : ""}`}
            value={phone}
            onChange={(e) => {
              if (!/^\d*$/.test(e.target.value)) {
                return;
              }

              setPhone(e.target.value);
              setError("");
            }}
          />
        </div>
      </div>

      {/* password */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          required
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            password && error === "" ? "border-red-500" : ""
          }`}
        />
      </div>
      {/* confirm password */}
      <div>
        <label
          htmlFor="confirm-password"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Confirm Password
        </label>
        <input
          id="confirm-password"
          type="password"
          placeholder="Confirm your password"
          required
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setError("");
          }}
          className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            confirmPassword && error === "" ? "border-red-500" : ""
          }`}
        />
      </div>
      <button
        type="submit"
        className="button-green w-full"
        onClick={(e) => {
          handleSubmit(e);
          setPassword("");
          setConfirmPassword("");
        }}
      >
        {loading ? "Signing Up..." : "Sign Up"}
      </button>

      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{" "}
        <a href="/login" className="text-blue-500 hover:underline">
          Log in
        </a>
      </p>

      <div className={`text-red-500 absolute ${error ? "block" : "hidden"}`}>
        {error.charAt(0).toUpperCase() + error.slice(1)}
      </div>
    </form>
  );
}
