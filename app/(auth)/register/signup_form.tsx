"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import GoogleLogo from "@/assets/icon/google-logo.png";
import { signIn } from "next-auth/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

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

  const handleGoogleLogin = async () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

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
    await api
      .post(
        `/users/register`,
        {
          name,
          email,
          country_code: countryCode,
          phone,
          password,
        }
      )
      .then((response) => {
        if (response.status !== 200) {
          if (response.data.error) {
            setError(response.data.error);
          } else {
            setError("An unexpected error occurred. Please try again.");
          }

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
        <Label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Name
        </Label>
        <Input
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
        <Label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Email
        </Label>
        <Input
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
        <Label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Phone
        </Label>
        <div className="flex space-x-2">
          <Input
            type="text"
            value={countryCode}
            className="mt-1 block w-1/5 border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => {
              setCountryCode(e.target.value);
              setError("");
            }}
          />
          <Input
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
        <Label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Password
        </Label>
        <Input
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
        <Label
          htmlFor="confirm-password"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Confirm Password
        </Label>
        <Input
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

      <Button
        type="submit"
        className="w-full"
        onClick={(e) => {
          handleSubmit(e);
          setPassword("");
          setConfirmPassword("");
        }}
      >
        {loading ? "Signing Up..." : "Sign Up"}
      </Button>

      <div className="flex items-center justify-between">
        <hr className="w-full border-gray-300 dark:border-gray-600" />
        <span className="px-2 text-sm text-gray-500 dark:text-gray-400">
          OR
        </span>
        <hr className="w-full border-gray-300 dark:border-gray-600" />
      </div>

      <Button
        variant={"outline"}
        className="w-full"
        onClick={() => {
          handleGoogleLogin();
        }}
      >
        <Image
          src={GoogleLogo}
          alt="Google Logo"
          width={20}
          className="inline mr-2"
        />
        <span className="sm:inline">Sign Up with Google</span>
      </Button>

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
