"use client";

import React, { useMemo, useState } from "react";
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
        field: "classid",
        headerName: "Class",
        filter: true,
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: classes?.map((classItem) => classItem.id) || [],
        },
        valueFormatter: (params) => {
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
        toast("Role updated successfully!");
      } catch (error) {
        console.error("Failed to update role:", error);
        toast.error("Failed to update role.");
        event.node.setDataValue("role", event.oldValue);
      }
    }

    if (event.colDef.field === "classid") {
      try {
        const classId = Number(updatedData.classid);
        const selectedClass = classes?.find(
          (classItem) => classItem.id === classId,
        );

        if (!selectedClass) throw new Error("Class not found");

        await updateClassMutation.mutateAsync({
          userId: updatedData.id,
          classId: selectedClass.id,
        });

        toast("Class updated successfully!");
      } catch (error) {
        console.error("Failed to update class:", error);
        toast.error("Failed to update class.");
        event.node.setDataValue("classId", event.oldValue);
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
