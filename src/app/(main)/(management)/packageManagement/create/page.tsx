"use client";

import React from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import PackageForm from "~/app/_components/form/package-form";

export default function CreatePackagePage() {
  const router = useRouter();
  const createPackageMutation = api.package.createPackage.useMutation({
    onSuccess: () => {
      toast.success("Package created successfully!");
      router.push("/packageManagement");
    },
    onError: (error: any) => {
      console.error("Error:", error);
      toast.error("Failed to create package.");
    },
  });

  const handleSubmit = async (data: any) => {
    try {
      await createPackageMutation.mutateAsync(data);
    } catch (error) {
      console.error("Error creating package:", error);
    }
  };

  return (
    <div>
      <h1 className="flex justify-center text-2xl font-semibold">
        Create Package
      </h1>
      <PackageForm onSubmit={handleSubmit} />
    </div>
  );
}
