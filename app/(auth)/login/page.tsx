import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from "./login_form";
import Logo from "@/components/logo";
export async function generateMetadata() {
  return {
    title: "Login | Expensely",
  };
}
export default function LoginPage() {
  return (
    <div
      className="w-full min-h-screen flex flex-col items-center justify-center 
    bg-background"
    >
      <Logo className="text-4xl p-4 text-primary" />
      <Card className="max-sm:w-85 p-8 py-8 w-full max-w-md my-6">
        <CardHeader>
          <CardTitle className="text-xl">Log in to Expensely</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
