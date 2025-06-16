import ProfilePage from "./profile";

export async function generateMetadata() {
  return {
    title: "Profile | Expensely",
  };
}

export default function ProfilePageWrapper({}: {}) {
  return <ProfilePage />;
}
