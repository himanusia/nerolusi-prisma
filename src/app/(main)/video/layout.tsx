import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import VideoHeader from "./video-header";

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
      <VideoHeader isTka={isTka} />
      <div className="py-6">{children}</div>
    </div>
  );
}