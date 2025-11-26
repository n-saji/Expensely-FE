import Logo from "@/components/logo";
import SignUpForm from "./signup_form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function generateMetadata() {
  return {
    title: "Register | Expensely",
    description:
      "Create an account to start tracking your expenses effortlessly.",
  };
}

export default function SignUpPage() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-background">
      <Logo className="text-4xl p-4" />
      <Card className="max-sm:w-85 p-8 w-full max-w-md my-6">
        <CardHeader>
          <CardTitle className="text-xl">Create An Account</CardTitle>
        </CardHeader>
        <CardContent>
          <SignUpForm />
        </CardContent>
      </Card>
    </div>
  );
}
