"use client"
import { useSession } from "next-auth/react";
import DaftarRekaman from "~/app/_components/daftar-rekaman";
import LoadingPage from "~/app/loading";
import NoClassPage from "~/app/no-class";
import NoPackagePage from "~/app/no-package";

export default function RekamanPage() {
  const session = useSession();

  if (session.status === "loading") {
    return <LoadingPage />;
  }

  if (!session.data?.user?.enrolledUtbk) {
    return <NoPackagePage />;
  }

  if (!session.data.user.classid) {
    return <NoClassPage />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold text-green-600">Daftar Rekaman</h2>
        <p className="text-gray-700">
          Tonton ulang videonya agar kamu lebih paham!
        </p>
      </div>
      <DaftarRekaman mode="utbk" />
    </div>
  );
}
