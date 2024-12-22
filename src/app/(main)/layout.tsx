import Navbar from "../_components/navbar";

export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="size-full">
      <Navbar />
      <div className="container mx-auto p-4">{children}</div>
    </div>
  );
}
