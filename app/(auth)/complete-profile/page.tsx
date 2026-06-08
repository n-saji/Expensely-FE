import CompleteProfileWizard from "./complete_profile_wizard";
import Logo from "@/components/logo";

export async function generateMetadata() {
  return {
    title: "Complete Profile | Expensely",
  };
}

export default function CompleteProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-28 right-0 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-0 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-12">
          <div className="flex flex-col items-center text-center mb-8">
            <Logo className="text-4xl p-2 text-primary" />
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mt-1">
              Account Onboarding
            </p>
            <h1 className="mt-2 text-2xl md:text-3xl font-semibold">
              Let&apos;s Complete Your Profile
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-md">
              Configure your essential preferences, phone details, and password to finish setting up your account.
            </p>
          </div>
          <CompleteProfileWizard />
        </div>
      </div>
    </div>
  );
}
