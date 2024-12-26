import { auth } from "~/server/auth";
import { redirect } from "next/navigation";

export default async function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session || session.user.role == "user") {
    redirect("/");
  }

  return <div className="size-full">{children}</div>;
}
