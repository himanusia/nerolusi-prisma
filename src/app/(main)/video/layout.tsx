import VideoHeader from "./video-header";

export default async function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="size-full">
      <VideoHeader />
      <div className="py-6">{children}</div>
    </div>
  );
}
