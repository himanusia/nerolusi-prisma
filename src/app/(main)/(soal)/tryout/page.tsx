"use client";

import { useSession } from "next-auth/react";
import TryoutList from "./tryout-list";

export default function TryoutListPage() {
  const { data: session } = useSession();

  const classId = session?.user?.classid;

  if (!classId) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">
          You are not enrolled in any class
        </h1>
        <p className="mt-2">
          Please contact your administrator to assign you to a class.
        </p>
      </div>
    );
  }

  return <TryoutList classId={classId} />;
}
