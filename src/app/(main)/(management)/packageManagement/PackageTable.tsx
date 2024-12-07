"use client";

import React, { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Package } from "@prisma/client";

export default function PackageTable({
  packageData,
}: {
  packageData: Package[];
}) {
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
    ],
    [],
  );

  return (
    <div className="ag-theme-alpine" style={{ height: 400, width: "100%" }}>
      <AgGridReact
        rowData={packageData}
        columnDefs={columnDefs}
        pagination={true}
        paginationPageSize={10}
      />
    </div>
  );
}
