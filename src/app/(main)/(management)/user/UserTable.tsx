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
  const updateClassMutation = api.user.updateClass.useMutation();

  const { data: classes } = api.class.getAllClasses.useQuery();

  const columnDefs: ColDef<User>[] = useMemo(
    () => [
      {
        field: "id",
        headerName: "ID",
        sortable: true,
        filter: "agTextColumnFilter",
      },
      {
        field: "name",
        headerName: "Name",
        sortable: true,
        filter: "agTextColumnFilter",
      },
      {
        field: "email",
        headerName: "Email",
        sortable: true,
        filter: "agTextColumnFilter",
      },
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
        field: "classid",
        headerName: "Class",
        filter: "agTextColumnFilter",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: [null, ...(classes?.map((classItem) => classItem.id) || [])],
        },
        valueFormatter: (params) => {
          if (!params.value) return "No Class";
          const classItem = classes?.find((c) => c.id === params.value);
          return classItem ? classItem.name : "";
        },
      },
      {
        field: "createdAt",
        headerName: "Created At",
        sortable: true,
        filter: true,
        valueFormatter: (params) => new Date(params.value).toLocaleString(),
      },
    ],
    [classes],
  );

  const onCellValueChanged = async (event: any) => {
    const updatedData = event.data;

    if (event.colDef.field === "role") {
      try {
        await updateRoleMutation.mutateAsync({
          id: updatedData.id,
          role: updatedData.role,
        });
        toast.success("Role updated successfully!");
      } catch (error) {
        console.error("Failed to update role:", error);
        toast.error("Failed to update role.");
        event.node.setDataValue("role", event.oldValue);
      }
    }

    if (event.colDef.field === "classid") {
      try {
        const classId = updatedData.classid
          ? Number(updatedData.classid)
          : null;
        await updateClassMutation.mutateAsync({
          userId: updatedData.id,
          classId,
        });

        toast.success("Class updated successfully!");
      } catch (error) {
        console.error("Failed to update class:", error);
        toast.error("Failed to update class.");
        event.node.setDataValue("classId", event.oldValue);
      }
    }
  };

  return (
    <div className="ag-theme-alpine size-full h-[80vh]">
      <AgGridReact
        rowData={userData}
        columnDefs={columnDefs}
        pagination={true}
        paginationPageSize={15}
        onCellValueChanged={onCellValueChanged}
      />
    </div>
  );
}
