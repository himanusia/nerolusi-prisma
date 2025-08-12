import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import ProfileDetail from "./profile-detail";

export default async function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session) {
    redirect("/signin");
  }
  
  return (
    <div className="size-full">
      <ProfileDetail />
      <div className="container mx-auto max-w-7xl ">{children}</div>
    </div>
  );
}