import Link from "next/link";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function TryoutListPage() {
  const session = await auth();

  if (!session || !session.user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">You are not authenticated</h1>
        <p className="mt-2">Please log in to access this page.</p>
      </div>
    );
  }

  const classId = session.user.classid;

  if (!classId) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">
          You are not enrolled in any class
        </h1>
        <p className="mt-2">
          Please contact your administrator to assign you to a class.
        </p>
      </div>
    );
  }

  const data = await api.package.getPackages({ classId });

  return (
    <div className="flex flex-col gap-3">
      {data?.map((pkg) => (
        <Link
          key={pkg.id}
          href={`/tryout/${pkg.id}`}
          className="flex flex-col rounded-xl border bg-inherit p-3"
        >
          <h3>{pkg.name}</h3>
          <p>Type: {pkg.type}</p>
          {pkg.TOstart && <p>Start Date: {pkg.TOstart.toLocaleString()}</p>}
          {pkg.TOend && <p>End Date: {pkg.TOend.toLocaleString()}</p>}
        </Link>
      ))}
    </div>
  );
}
