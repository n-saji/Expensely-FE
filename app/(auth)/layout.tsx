import UserPreferences from "@/utils/userPreferences";
const maintenanceMode = process.env.NEXT_MAINTENANCE_MODE === "true";
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="w-full min-h-screen bg-gray-200 dark:bg-gray-900">
      {maintenanceMode && (
        <div className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
          <h1 className="mb-4 text-3xl font-semibold tracking-tight">
            We’ll be back soon 🚀
          </h1>

          <div className="max-w-md space-y-4 text-lg text-gray-600">
            <p>
              Expensely is temporarily unavailable while we upgrade our backend
              services to serve you better.
            </p>

            <p>Thanks for your patience and support! 💙</p>
          </div>

          <p className="mt-8 text-sm text-gray-400">
            — Nikhil, Creator of Expensely
          </p>
        </div>
      )}
      {!maintenanceMode && children}

      <UserPreferences />
    </div>
  );
}
