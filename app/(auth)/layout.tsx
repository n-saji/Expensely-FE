import UserPreferences from "@/utils/userPreferences";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="w-full min-h-screen bg-gray-200 dark:bg-gray-900">
      {children}

      <UserPreferences />
    </div>
  );
}
