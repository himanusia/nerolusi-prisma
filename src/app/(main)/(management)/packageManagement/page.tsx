import Link from "next/link";
import { Button } from "~/app/_components/ui/button";
import { api } from "~/trpc/server";
import PackageTable from "./PackageTable";

export default async function Page() {
  const pkg = await api.package.getAllPackages();

  return (
    <div>
      <Button asChild variant={"outline"}>
        <Link href="/packageManagement/create">Create</Link>
      </Button>
      <PackageTable packageData={pkg} />
    </div>
  );
}
