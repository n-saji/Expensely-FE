import ProfilePage from "@/app/(pages)/profile/profile";

export async function generateMetadata() {
  return {
    title: "Complete Profile | Expensely",
  };
}

export default function CompleteProfilePage() {
  return (
    <div
      className="flex items-center justify-center
    "
    >
      <div className="bg-gray-300 p-8 m-4 sm:m-8 rounded shadow-md w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-4">Complete Your Profile</h1>
        <p className="mb-6">Please fill out the empty fields.</p>
        <ProfilePage reRouteToDashboard={true} />
      </div>
    </div>
  );
}
