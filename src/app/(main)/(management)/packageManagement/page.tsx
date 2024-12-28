"use client";

import { Button } from "~/app/_components/ui/button";
import { api } from "~/trpc/react";
import PackageTable from "./PackageTable";
import { useRouter } from "next/navigation";
import ErrorPage from "~/app/error";
import LoadingPage from "~/app/loading";

export default function PackageManagementPage() {
  const router = useRouter();
  const {
    data: packages,
    refetch,
    isLoading,
    isError,
  } = api.package.getAllPackages.useQuery();

  return isError ? (
    <ErrorPage />
  ) : isLoading ? (
    <LoadingPage />
  ) : (
    <div className="flex flex-col gap-4">
      <Button onClick={() => router.push("/packageManagement/create")}>
        Create Package
      </Button>
      <PackageTable packageData={packages} refetchPackages={refetch} />
    </div>
  );
}
