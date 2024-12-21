"use client";

import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useMemo } from "react";
import { ColDef } from "ag-grid-community";

export default function PackageManagementPage() {
  const { id } = useParams();
  const packageId = parseInt(Array.isArray(id) ? id[0] : id, 10);

  const { data, isLoading, error } = api.package.getUsersByPackage.useQuery({
    packageId,
  });

  const columnDefs = useMemo<
    ColDef<{ name: string; email: string; score: number }>[]
  >(
    () => [
      { headerName: "Name", field: "name", sortable: true, filter: true },
      { headerName: "Email", field: "email", sortable: true, filter: true },
      { headerName: "Score", field: "score", sortable: true, filter: true },
    ],
    [],
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No users found for this package.</div>;

  // Transform data for Ag Grid
  const rowData = data.map((user) => ({
    name: user.name || "Unnamed User",
    email: user.email || "N/A",
    score: user.score,
  }));

  return (
    <div className="ag-theme-alpine" style={{ height: 400, width: "100%" }}>
      <h1 className="text-xl font-bold">Package ID: {id}</h1>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        pagination={true}
        paginationPageSize={10}
      />
    </div>
  );
}
