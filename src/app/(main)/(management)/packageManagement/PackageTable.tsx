"use client";

import React, { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Package, Type } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Button } from "~/app/_components/ui/button";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { api } from "~/trpc/react";

export default function PackageTable({
  packageData,
  refetchPackages,
}: {
  packageData: {
    type?: Type;
    name?: string;
    id?: number;
    classId?: number;
    TOstart?: string | Date;
    TOend?: string | Date;
  }[];
  refetchPackages: () => void;
}) {
  const router = useRouter();

  const deletePackageMutation = api.package.deletePackage.useMutation({
    onSuccess: () => {
      toast.success("Package deleted successfully!");
      refetchPackages();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete package.");
    },
  });

  const handleDelete = async (packageId: number) => {
    if (confirm("Are you sure you want to delete this package?")) {
      await deletePackageMutation.mutateAsync({ id: packageId });
    }
  };

  const columnDefs = useMemo(
    () => [
      {
        field: "id" as keyof Package,
        headerName: "ID",
        sortable: true,
        filter: true,
      },
      {
        field: "name" as keyof Package,
        headerName: "Name",
        sortable: true,
        filter: true,
      },
      {
        field: "type" as keyof Package,
        headerName: "Type",
        sortable: true,
        filter: true,
      },
      {
        field: "TOstart" as keyof Package,
        headerName: "Start Date",
        sortable: true,
        filter: true,
      },
      {
        field: "TOend" as keyof Package,
        headerName: "End Date",
        sortable: true,
        filter: true,
      },
      {
        field: "classId" as keyof Package,
        headerName: "Class",
        sortable: true,
        filter: true,
      },
      {
        headerName: "Actions",
        cellRenderer: (params: any) => {
          return (
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  router.push(`/packageManagement/${params.data.id}`)
                }
              >
                Manage
              </Button>
              <Button
                variant="destructive"
                className="flex items-center"
                onClick={() => handleDelete(params.data.id!)}
              >
                <Trash2Icon />
              </Button>
            </div>
          );
        },
      },
    ],
    [router],
  );

  return (
    <div className="ag-theme-alpine size-full h-[80vh]">
      <AgGridReact
        rowData={packageData}
        columnDefs={columnDefs}
        pagination={true}
        paginationPageSize={15}
      />
    </div>
  );
}
