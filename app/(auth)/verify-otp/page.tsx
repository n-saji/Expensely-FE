import Logo from "@/components/logo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OtpForm from "./otp_form";

const maintenanceMode = process.env.NEXT_MAINTENANCE_MODE === "true";

export async function generateMetadata() {
  return {
    title: maintenanceMode
      ? "Under Maintenance | Expensely"
      : "Verify Email | Expensely",
    description: "Verify your email address to continue using Expensely.",
  };
}

export default function VerifyOtpPage() {
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
                One more step
              </p>
              <h1 className="mt-4 text-3xl font-semibold">Verify your email</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Enter the 6-digit OTP sent to your inbox to activate your
                account.
              </p>
            </div>
            <Card className="mt-8 border border-border/70 bg-card/90 p-2 shadow-lg gap-3">
              <CardHeader>
                <CardTitle className="text-xl pt-3">Email OTP</CardTitle>
              </CardHeader>
              <CardContent>
                <OtpForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
