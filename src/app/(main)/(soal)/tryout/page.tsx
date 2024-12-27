"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "~/app/_components/ui/button";
import { api } from "~/trpc/react";

export default function TryoutListPage() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session || !session.user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">You are not authenticated</h1>
        <p className="mt-2">Please log in to access this page.</p>
      </div>
    );
  }

  const classId = session.user.classid;

  if (!classId) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">
          You are not enrolled in any class
        </h1>
        <p className="mt-2">
          Please contact your administrator to assign you to a class.
        </p>
      </div>
    );
  }

  const {
    data: packages,
    isLoading,
    isError,
  } = api.package.getTryoutPackages.useQuery({ classId });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error fetching packages.</div>;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-2xl font-bold">Tryout List</h1>
      <p>Select a tryout package to start</p>
      <div className="flex flex-col rounded-lg border">
        {packages?.map((pkg) => (
          <Button
            key={pkg.id}
            variant="ghost"
            onClick={() => {
              router.push(`/tryout/${pkg.id}`);
            }}
            className="flex size-fit w-full flex-col rounded-none border-b p-3"
          >
            <h3 className="font-bold">{pkg.name}</h3>
            {pkg.TOstart && <p>Start Date: {pkg.TOstart.toLocaleString()}</p>}
            {pkg.TOend && <p>End Date: {pkg.TOend.toLocaleString()}</p>}
          </Button>
        ))}
      </div>
    </div>
  );
}
