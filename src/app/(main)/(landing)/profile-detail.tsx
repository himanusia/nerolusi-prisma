'use client';
import ProfilCard from "./profil-card";
import TokenCard from "~/app/_components/token-card";
import DaysLeft from "./days-left";
import { useSession } from "next-auth/react";
import Mode from "./mode";

export default function ProfileDetail() {
    const { data: session, status } = useSession();
    const user = session?.user;
    const isLoading = status === "loading";

  return (
    <div className="size-full mb-4">
      <div className="hidden w-full items-center justify-evenly md:flex ">
        <div className="flex flex-wrap items-center gap-3">
          <ProfilCard user={{ image: user?.image ?? "", name: user?.name ?? "" }} />
          <TokenCard tokenAmount={2} />
        </div>
        <Mode />

        <DaysLeft />
      </div>
      <div className="flex flex-col gap-4 md:hidden items-center justify-center w-full overflow-auto">
        <ProfilCard user={{ image: user?.image ?? "", name: user?.name ?? "" }} />
        <div className="flex items-center justify-evenly w-full text-sm">
          {/* <TokenCard /> */}
          <Mode />
          <DaysLeft />
        </div>
      </div>
    </div>
  );
}