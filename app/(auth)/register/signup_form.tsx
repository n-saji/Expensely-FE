"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Image from "next/image";
import GoogleLogo from "@/assets/icon/google-logo.png";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { AxiosError } from "axios";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  DISPOSABLE_EMAIL_DOMAINS,
  STRONG_PASSWORD_REGEX,
  TOP_100_COUNTRY_CODES,
  type CountryCodeOption,
} from "./register_form_constants";

const NAME_REGEX = /^[a-zA-Z\s]+$/;
const EMAIL_REGEX = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;

const getEmailDomain = (email: string) =>
  email.split("@")[1]?.toLowerCase() || "";

const isDisposableEmail = (email: string) => {
  const domain = getEmailDomain(email);
  return [...DISPOSABLE_EMAIL_DOMAINS].some(
    (blockedDomain) =>
      domain === blockedDomain || domain.endsWith(`.${blockedDomain}`),
  );
};

const COUNTRY_CODE_VALUES = new Set(
  TOP_100_COUNTRY_CODES.map((item) => item.value),
);

const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .regex(NAME_REGEX, "Name can only contain letters and spaces"),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .regex(EMAIL_REGEX, "Invalid email format")
      .refine((value) => !isDisposableEmail(value), {
        message: "Temporary/disposable email domains are not allowed",
      }),
    countryCode: z
      .string()
      .trim()
      .min(1, "Country code is required")
      .refine((value) => COUNTRY_CODE_VALUES.has(value), {
        message: "Please select a valid country code",
      }),
    phone: z
      .string()
      .trim()
      .regex(/^\d{10}$/, "Phone number must be 10 digits"),
    password: z
      .string()
      .min(1, "Password is required")
      .regex(
        STRONG_PASSWORD_REGEX,
        "Password must be at least 8 characters with letters, numbers, and special characters",
      ),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

type CountrySelectOption = CountryCodeOption & {
  id: string;
};

type PasswordStrength = {
  color: "red" | "yellow" | "green";
  widthClass: string;
  label: string;
};

const getPasswordStrength = (password: string): PasswordStrength => {
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z\d]/.test(password);
  const hasMinimumLength = password.length >= 8;
  const hasRequiredRules =
    hasLetter && hasNumber && hasSpecial && hasMinimumLength;

  if (!hasRequiredRules) {
    return { color: "red", widthClass: "w-1/3", label: "Weak" };
  }

  if (password.length < 10) {
    return { color: "yellow", widthClass: "w-2/3", label: "Medium" };
  }

  return { color: "green", widthClass: "w-full", label: "Strong" };
};

const resolveApiErrorMessage = (error: unknown) => {
  if (!(error instanceof AxiosError)) {
    return "Request failed. Please try again.";
  }

  if (error.response?.status && error.response.status >= 500) {
    return "Internal server error. Please try again later.";
  }

  const backendMessage =
    error.response?.data?.error || error.response?.data?.message;
  return typeof backendMessage === "string" && backendMessage
    ? backendMessage
    : "Request failed. Please try again.";
};

export default function SignUpForm() {
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const countryCodeOptions = useMemo<CountrySelectOption[]>(
    () =>
      TOP_100_COUNTRY_CODES.map((option, index) => ({
        ...option,
        id: `${option.value}-${index}`,
      })).sort((a, b) => a.label.localeCompare(b.label)),
    [],
  );

  const defaultCountryOptionId =
    countryCodeOptions.find((option) => option.value === "+1")?.id ||
    countryCodeOptions[0]?.id ||
    "";
  const [selectedCountryOptionId, setSelectedCountryOptionId] = useState(
    defaultCountryOptionId,
  );

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      countryCode: "+1",
      phone: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const password = form.watch("password") || "";
  const confirmPassword = form.watch("confirmPassword") || "";
  const passwordStrength = getPasswordStrength(password);

  const handleGoogleLogin = async () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  const onSubmit = async (values: RegisterFormValues) => {
    if (loading) {
      return;
    }

    setApiError("");
    setLoading(true);
    try {
      const response = await api.post(`/users/register`, {
        name: values.name,
        email: values.email,
        country_code: values.countryCode,
        phone: values.phone,
        password: values.password,
        currency: "USD",
      });

      if (response.status !== 200) {
        if (response.data.error) {
          setApiError(response.data.error);
        } else {
          setApiError("An unexpected error occurred. Please try again.");
        }
        return;
      }

      const pendingUserId =
        response.data?.id || response.data?.userId || response.data?.user?.id;
      localStorage.removeItem("pending_verify_user_id");

      if (!pendingUserId) {
        setApiError(
          "Verification session could not be created. Please try registering again.",
        );
        return;
      }

      localStorage.setItem("pending_verify_user_id", pendingUserId);
      localStorage.setItem("pending_verify_email", values.email);
      localStorage.setItem("otp_auto_resend", "0");

      form.reset({
        name: "",
        email: "",
        countryCode: "+1",
        phone: "",
        password: "",
        confirmPassword: "",
      });
      setSelectedCountryOptionId(defaultCountryOptionId);
      router.push("/verify-otp");
    } catch (error) {
      console.error("Error during signup:", error);
      setApiError(resolveApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const errors = form.formState.errors;
  const passwordsMatch =
    confirmPassword.length > 0 && confirmPassword === password;

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor="name" className="text-sm text-muted-foreground">
            Name
          </FieldLabel>
          <Input
            id="name"
            type="text"
            placeholder="Enter your name"
            className="w-full border-border/70 bg-background"
            value={form.watch("name")}
            onChange={(e) => {
              form.setValue("name", e.target.value, {
                shouldDirty: true,
                shouldValidate: true,
              });
              setApiError("");
            }}
          />
          <FieldError>{errors.name?.message}</FieldError>
        </Field>

        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor="email" className="text-sm text-muted-foreground">
            Email
          </FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="w-full border-border/70 bg-background"
            value={form.watch("email")}
            onChange={(e) => {
              form.setValue("email", e.target.value, {
                shouldDirty: true,
                shouldValidate: true,
              });
              setApiError("");
            }}
          />
          <FieldError>{errors.email?.message}</FieldError>
        </Field>

        <Field data-invalid={Boolean(errors.countryCode)}>
          <FieldLabel className="text-sm text-muted-foreground">
            Country Code
          </FieldLabel>
          <Select
            value={selectedCountryOptionId}
            onValueChange={(optionId) => {
              const selectedOption = countryCodeOptions.find(
                (option) => option.id === optionId,
              );

              if (!selectedOption) {
                return;
              }

              setSelectedCountryOptionId(optionId);
              form.setValue("countryCode", selectedOption.value, {
                shouldDirty: true,
                shouldValidate: true,
              });
              setApiError("");
            }}
          >
            <SelectTrigger className="w-full border-border/70 bg-background">
              <SelectValue placeholder="Select country code" />
            </SelectTrigger>
            <SelectContent>
              {countryCodeOptions.length ? (
                countryCodeOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))
              ) : (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  No country codes found
                </div>
              )}
            </SelectContent>
          </Select>
          <FieldError>{errors.countryCode?.message}</FieldError>
        </Field>

        <Field data-invalid={Boolean(errors.phone)}>
          <FieldLabel htmlFor="phone" className="text-sm text-muted-foreground">
            Phone
          </FieldLabel>
          <Input
            id="phone"
            type="tel"
            placeholder="Enter your 10 digit phone number"
            className="w-full border-border/70 bg-background"
            value={form.watch("phone")}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
              form.setValue("phone", digits, {
                shouldDirty: true,
                shouldValidate: true,
              });
              setApiError("");
            }}
          />
          <FieldError>{errors.phone?.message}</FieldError>
        </Field>

        <Field data-invalid={Boolean(errors.password)}>
          <FieldLabel
            htmlFor="password"
            className="text-sm text-muted-foreground"
          >
            Password
          </FieldLabel>
          <Input
            id="password"
            type="password"
            placeholder="Create a password"
            className="w-full border-border/70 bg-background"
            value={password}
            onChange={(e) => {
              form.setValue("password", e.target.value, {
                shouldDirty: true,
                shouldValidate: true,
              });
              setApiError("");
            }}
          />
          {password.length > 0 ? (
            <div className="space-y-1.5">
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all",
                    passwordStrength.widthClass,
                    passwordStrength.color === "red" && "bg-rose-500",
                    passwordStrength.color === "yellow" && "bg-amber-400",
                    passwordStrength.color === "green" && "bg-emerald-500",
                  )}
                />
              </div>
              <FieldDescription>
                Password strength: {passwordStrength.label}
              </FieldDescription>
            </div>
          ) : null}
          <FieldError>{errors.password?.message}</FieldError>
        </Field>

        <Field data-invalid={Boolean(errors.confirmPassword)}>
          <FieldLabel
            htmlFor="confirm-password"
            className="text-sm text-muted-foreground"
          >
            Confirm Password
          </FieldLabel>
          <Input
            id="confirm-password"
            type="password"
            placeholder="Confirm your password"
            className="w-full border-border/70 bg-background"
            value={confirmPassword}
            onChange={(e) => {
              form.setValue("confirmPassword", e.target.value, {
                shouldDirty: true,
                shouldValidate: true,
              });
              setApiError("");
            }}
          />

          <FieldError>{errors.confirmPassword?.message}</FieldError>
        </Field>
      </FieldGroup>

      {apiError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {apiError.charAt(0).toUpperCase() + apiError.slice(1)}
        </div>
      ) : null}

      <Button type="submit" className="w-full" disabled={loading}>
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
        type="button"
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
