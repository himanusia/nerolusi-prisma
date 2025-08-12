import { auth } from "~/server/auth";
import Navbar from "~/app/_components/navbar";
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
      <div className="container mx-auto p-4 max-w-7xl">{children}</div>
    </div>
  );
}
