"use client";
export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-200">
      <div className="max-sm:w-85 bg-gray-50 max-sm:p-8 p-16 rounded-2xl shadow-lg w-full max-w-md mt-10 flex flex-col items-center my-4">
        <h1 className="text-3xl font-semibold text-gray-600 pb-8">Login Error</h1>
        <p className="text-gray-500">
          An error occurred while trying to log in. Please try again later. {error.message}
        </p>
      </div>
    </div>
  );
}

