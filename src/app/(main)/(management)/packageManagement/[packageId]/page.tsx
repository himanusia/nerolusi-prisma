"use client";

import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useMemo } from "react";
import { ColDef } from "ag-grid-community";
import { Button } from "~/app/_components/ui/button";
import ErrorPage from "~/app/error";
import LoadingPage from "~/app/loading";

export default function PackageManagementPage() {
  const params = useParams();
  const router = useRouter();
  const packageId = parseInt(
    Array.isArray(params.packageId) ? params.packageId[0] : params.packageId,
    10,
  );

  const { data, isLoading, isError } = api.package.getUsersByPackage.useQuery({
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
                      router.push(
                        `/drill/admin/${packageId}/${selectedSessionId}?userId=${params.data.id}`,
                      );
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

  if (!data) return <LoadingPage />;

  const rowData = data.map((user) => ({
    quizSession: user.quizSession,
    id: user.id,
    name: user.name || "Unnamed User",
    email: user.email || "N/A",
    score: user.score,
  }));

  return isError ? (
    <ErrorPage />
  ) : isLoading ? (
    <LoadingPage />
  ) : (
    <div className="ag-theme-alpine size-full h-[80vh]">
      <div className="mb-4 flex w-full items-center justify-between">
        <h1 className="text-xl font-bold">Package ID: {packageId}</h1>
        <Button
          onClick={() => router.push(`/packageManagement/${packageId}/edit`)}
        >
          Edit
        </Button>
      </div>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        pagination={true}
        paginationPageSize={15}
      />
    </div>
  );
}
