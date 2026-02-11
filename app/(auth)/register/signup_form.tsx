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
      .post(`/users/register`, {
        name,
        email,
        country_code: countryCode,
        phone,
        password,
      })
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
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="name" className="text-sm text-muted-foreground">
          Name
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="Enter your name"
          required
          className="mt-2 w-full border-border/70 bg-background"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
        />
      </div>

      <div>
        <Label htmlFor="email" className="text-sm text-muted-foreground">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          required
          className="mt-2 w-full border-border/70 bg-background"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
        />
      </div>

      <div>
        <Label htmlFor="phone" className="text-sm text-muted-foreground">
          Phone
        </Label>
        <div className="mt-2 flex gap-2">
          <Input
            type="text"
            value={countryCode}
            className="w-1/4 border-border/70 bg-background"
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
            className="w-3/4 border-border/70 bg-background"
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

      <div>
        <Label htmlFor="password" className="text-sm text-muted-foreground">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a password"
          required
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          className="mt-2 w-full border-border/70 bg-background"
        />
      </div>

      <div>
        <Label
          htmlFor="confirm-password"
          className="text-sm text-muted-foreground"
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
          className="mt-2 w-full border-border/70 bg-background"
        />
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error.charAt(0).toUpperCase() + error.slice(1)}
        </div>
      ) : null}

      <Button type="submit" className="w-full">
        {loading ? "Signing Up..." : "Sign Up"}
      </Button>

      <div className="flex items-center gap-3">
        <hr className="w-full border-border/60" />
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          or
        </span>
        <hr className="w-full border-border/60" />
      </div>

      <Button
        variant={"outline"}
        className="w-full"
        onClick={() => {
          handleGoogleLogin();
        }}
      >
        <Image src={GoogleLogo} alt="Google Logo" width={20} className="mr-2" />
        <span className="sm:inline">Sign Up with Google</span>
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <a href="/login" className="text-emerald-600 hover:underline">
          Log in
        </a>
      </p>
    </form>
  );
}
