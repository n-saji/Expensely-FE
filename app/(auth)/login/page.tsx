import LoginForm from "./login_form";
import Logo from "@/components/logo";
export async function generateMetadata() {
  return {
    title: "Login | Expensely",
  };
}
export default function LoginPage() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center 
    bg-primary-color">
      <Logo className="text-4xl p-4 dark:text-green-500" />
      <div className="max-sm:w-85 bg-gray-50 dark:bg-gray-800 max-sm:p-8 px-16 py-8 rounded-2xl shadow-lg w-full max-w-md flex flex-col items-center my-4">
        <h1 className="text-2xl font-semibold text-gray-600 dark:text-gray-200 pb-8">
          Log in to Expensely
        </h1>
        <LoginForm />
      </div>
    </div>
  );
}
