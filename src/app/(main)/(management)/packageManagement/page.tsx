import Link from "next/link";
import { columns } from "~/app/(main)/(management)/packageManagement/pkg-columns";
import { DataTable } from "~/app/_components/table/data-table";
import { Button } from "~/app/_components/ui/button";
import { api } from "~/trpc/server";

export default async function Page() {
  const pkg = await api.package.getAllPackages();
  return (
    <div>
      <Button asChild variant={"outline"}>
        <Link href={`/packageManagement/${pkg.length + 1}`}>Create</Link>
      </Button>
      <DataTable columns={columns} data={pkg} />
    </div>
  );
}
