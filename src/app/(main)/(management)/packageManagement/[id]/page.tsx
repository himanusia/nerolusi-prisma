"use client";

import { useParams } from "next/navigation";
import { api } from "~/trpc/react";

export default function PackageManagementPage() {
  const { id } = useParams();
  const packageId = parseInt(Array.isArray(id) ? id[0] : id, 10);

  const { data, isLoading, error } = api.package.getUsersByPackage.useQuery({
    packageId,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No users found for this package.</div>;

  return (
    <div>
      <h1>Users who completed Package ID: {id}</h1>
      <ul>
        {data?.map((user) => (
          <li key={user.id}>
            {user.name || "Unnamed User"} (Email: {user.email || "N/A"})
          </li>
        ))}
      </ul>
    </div>
  );
}
