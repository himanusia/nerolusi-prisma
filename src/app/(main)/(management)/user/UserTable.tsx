"use client";

import React, { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ColDef } from "ag-grid-community";
import { User } from "@prisma/client";
import { toast } from "sonner";
import { api } from "~/trpc/react";

export default function UserTable({ userData }: { userData: User[] }) {
  const updateRoleMutation = api.user.updateRole.useMutation();

  const columnDefs: ColDef<User>[] = useMemo(
    () => [
      { field: "id", headerName: "ID", sortable: true, filter: true },
      { field: "name", headerName: "Name", sortable: true, filter: true },
      { field: "email", headerName: "Email", sortable: true, filter: true },
      {
        field: "role",
        headerName: "Role",
        sortable: true,
        filter: true,
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: ["user", "teacher", "admin"],
        },
      },
      {
        field: "createdAt",
        headerName: "Created At",
        sortable: true,
        filter: true,
      },
    ],
    [],
  );

  const onCellValueChanged = async (event: any) => {
    if (event.colDef.field === "role") {
      const updatedData = event.data;
      try {
        await updateRoleMutation.mutateAsync({
          id: updatedData.id,
          role: updatedData.role,
        });

        toast("Role updated successfully!");
      } catch (error) {
        console.error("Failed to update role:", error);
        toast.error("Failed to update role.");
        event.node.setDataValue("role", event.oldValue);
      }
    }
  };

  return (
    <div className="ag-theme-alpine" style={{ height: 400, width: "100%" }}>
      <AgGridReact
        rowData={userData}
        columnDefs={columnDefs}
        pagination={true}
        paginationPageSize={10}
        onCellValueChanged={onCellValueChanged}
      />
    </div>
  );
}
