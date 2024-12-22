import { auth } from "~/server/auth";
import Navbar from "../_components/navbar";
import { redirect } from "next/navigation";

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
      <Navbar />
      <div className="container mx-auto p-4">{children}</div>
    </div>
  );
}
