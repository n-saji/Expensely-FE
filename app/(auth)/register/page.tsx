"use client";
import Logo from "@/components/logo";
import SignUpForm from "./signup_form";

export default function SignUpPage() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-200 dark:bg-gray-900">
      <Logo className="text-4xl p-4" />
      <div className="max-sm:w-85 bg-gray-50 dark:bg-gray-800 max-sm:p-8 p-16 rounded-2xl shadow-lg w-full max-w-md  flex flex-col items-center my-4">
        <h1 className="text-3xl font-semibold text-gray-600 pb-8 dark:text-gray-200">
          Create An Account
        </h1>
        <SignUpForm />
      </div>
    </div>
  );
}
