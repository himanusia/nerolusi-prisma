"use client";

import { Button } from "~/app/_components/ui/button";
import { api } from "~/trpc/react";
import PackageTable from "./PackageTable";
import { useRouter } from "next/navigation";

export default function PackageManagementPage() {
  const router = useRouter();
  const {
    data: packages,
    refetch,
    isLoading,
    isError,
  } = api.package.getAllPackages.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error fetching packages.</div>;
  }

  return (
    <div>
      <Button
        asChild
        variant={"outline"}
        onClick={() => router.push("/packageManagement/create")}
      >
        Create
      </Button>
      <PackageTable packageData={packages} refetchPackages={refetch} />
    </div>
  );
}
