import Logo from "@/components/logo";

export async function generateMetadata() {
  return {
    title: "Forgot Password | Expensely",
  };
}


export default function ForgotPasswordPage() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-200">
      <Logo />
      <div className="max-sm:w-85 bg-gray-50 max-sm:p-8 p-16 rounded-2xl shadow-lg w-full max-w-md mt-10 flex flex-col items-center my-4">
        <h1 className="text-3xl font-semibold text-gray-600 pb-8">
          Forgot Password
        </h1>
        <form className="space-y-5 w-full">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
              required
            />
          </div>
          <button type="submit" className="button-blue w-full">
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
}
