import CreatePackage from "./create-package";

export default function Page({
  params: { packageId },
}: {
  params: { packageId: string };
}) {
  return (
    <main className="flex w-full flex-col">
      <CreatePackage packageId={packageId} />
    </main>
  );
}
