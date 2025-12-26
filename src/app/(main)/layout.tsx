import { auth } from "~/server/auth";
import Navbar from "~/app/_components/navbar";
import { redirect } from "next/navigation";
import { ModeProvider } from "~/contexts/mode-context";

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
    <ModeProvider>
      <div className="size-full">
        <Navbar />
        <div className="container mx-auto max-w-7xl p-4">{children}</div>
      </div>
    </ModeProvider>
  );
}
