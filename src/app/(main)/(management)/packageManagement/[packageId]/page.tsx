"use client";

import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useMemo } from "react";
import { ColDef } from "ag-grid-community";
import { Button } from "~/app/_components/ui/button";

export default function PackageManagementPage() {
  const params = useParams();
  const router = useRouter();
  const packageId = parseInt(
    Array.isArray(params.packageId) ? params.packageId[0] : params.packageId,
    10,
  );

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
      {
        headerName: "Actions",
        cellRenderer: (params: any) => {
          const quizSessions = params.data.quizSession || [];
          return (
            <div className="flex flex-col gap-2">
              {quizSessions.length > 0 ? (
                <select
                  onChange={(e) => {
                    const selectedSessionId = e.target.value;
                    if (selectedSessionId) {
                      router.push(`/tryout/${packageId}/${selectedSessionId}`);
                    }
                  }}
                  defaultValue=""
                  className="rounded border p-1"
                >
                  <option value="" disabled>
                    Select Session
                  </option>
                  {quizSessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.subtest.type || `Session ${session.id}`}
                    </option>
                  ))}
                </select>
              ) : (
                <span>No sessions</span>
              )}
            </div>
          );
        },
      },
    ],
    [],
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No users found for this package.</div>;

  const rowData = data.map((user) => ({
    quizSession: user.quizSession,
    name: user.name || "Unnamed User",
    email: user.email || "N/A",
    score: user.score,
  }));

  return (
    <div className="ag-theme-alpine" style={{ height: 400, width: "100%" }}>
      <h1 className="text-xl font-bold">Package ID: {packageId}</h1>
      <Button
        onClick={() => router.push(`/packageManagement/${packageId}/edit`)}
      >
        Edit
      </Button>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        pagination={true}
        paginationPageSize={10}
      />
    </div>
  );
}
