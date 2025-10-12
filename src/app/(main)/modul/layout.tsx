import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import ModulHeader from "./modul-header";

export default async function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session) {
    redirect("/signin");
  }

  const isTka = session.user.enrolledTka;

  return (
    <div className="size-full">
      <ModulHeader />
      <div className="py-6">{children}</div>
    </div>
  );
}