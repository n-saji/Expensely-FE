import { cookies } from "next/headers";
import DashboardClient from "./common-client";

export default async function DashboardPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  return (
    <DashboardClient token={cookieStore.get("refreshToken")?.value || null}>
      {children}
    </DashboardClient>
  );
}
