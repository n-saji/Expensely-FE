"use client";
export default function ErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-red-600">Something went wrong</h1>
      <p className="mt-4 text-gray-600">
        We`&apos;`re sorry, but we couldn`&apos;`t process your request. Please log in again.
      </p>
    </div>
  );
}
