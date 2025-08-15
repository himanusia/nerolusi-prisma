"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import AdminDashboard from "./(management)/admin-dashboard";
import LoadingPage from "../loading";
import NoPackagePage from "../no-package";

export default function RootPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <ConditionalPage />
    </Suspense>
  );
}

function ConditionalPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <LoadingPage />;
  }

  if (!session?.user) {
    redirect("/signin");
  }

  if (session.user.role === "admin") {
    return <AdminDashboard />;
  }  else {
    return <NoPackagePage />;
  }
}
