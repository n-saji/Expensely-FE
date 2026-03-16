import Logo from "@/components/logo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ResetPasswordForm from "./reset_password_form";

const maintenanceMode = process.env.NEXT_MAINTENANCE_MODE === "true";

export async function generateMetadata() {
  return {
    title: maintenanceMode
      ? "Under Maintenance | Expensely"
      : "Reset Password | Expensely",
    description: "Choose a new secure password for your Expensely account.",
  };
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-28 right-0 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-0 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
          <div className="w-full max-w-md">
            <div className="flex flex-col items-center text-center">
              <Logo className="text-4xl p-4 text-primary" />
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
                Secure your account
              </p>
              <h1 className="mt-4 text-3xl font-semibold">
                Set a new password
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Create a strong password to continue using Expensely safely.
              </p>
            </div>

            <Card className="mt-8 border border-border/70 bg-card/90 p-2 shadow-lg gap-3">
              <CardHeader>
                <CardTitle className="text-xl pt-3">Reset password</CardTitle>
              </CardHeader>
              <CardContent>
                <ResetPasswordForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
