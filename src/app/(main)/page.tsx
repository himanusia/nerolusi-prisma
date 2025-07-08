"use client";

import { api } from "~/trpc/react";
import ErrorPage from "../error";
import LoadingPage from "../loading";
import { useEffect, useState } from "react";
import RekamanTerbaru from "./rekaman-terbaru";
import JadwalKegiatan from "./jadwal-kegiatan";
import TryOutTerbaru from "./try-out-terbaru";
import DaftarPilihan from "./daftar-pilihan";
import ProgressChart from "./progress-chart";
import { Separator } from "../_components/ui/separator";
import ProfilCard from "./profil-card";
import TokenCard from "./token-card";
import DaysLeft from "./days-left";

export default function MainPage() {
  const [content, setContent] = useState<string>("");

  const {
    data: user,
    isLoading: sessionLoading,
    isError: sessionError,
  } = api.user.getSessionUser.useQuery();
  const {
    data: announcement,
    isLoading: announcementLoading,
    isError: announcementError,
    refetch: refetchAnnouncement,
  } = api.quiz.getAnnouncement.useQuery();

  // const updateAnnouncement = api.quiz.upsertAnnouncement.useMutation({
  //   onSuccess: () => {
  //     toast.success("Announcement edited successfully!");
  //     refetchAnnouncement();
  //   },
  //   onError: (error) => {
  //     toast.error(error.message || "Failed to edit announcement.");
  //   },
  // });

  // useEffect(() => {
  //   setContent(announcement?.content || "");
  // }, [announcement]);

  return sessionError || announcementError ? (
    <ErrorPage />
  ) : sessionLoading || announcementLoading ? (
    <LoadingPage />
  ) : (
    <div className="flex size-full flex-col gap-4">
      {/* token info */}
      <div className="hidden w-full items-center justify-between md:flex">
        <div className="flex flex-wrap items-center gap-3">
          <ProfilCard user={user} />
          <TokenCard />
        </div>
        <DaysLeft />
      </div>
      <div className="flex flex-col gap-4 md:hidden items-center w-full overflow-auto">
        <ProfilCard user={user} />
        <div className="flex items-center justify-center w-full gap-2 text-sm">
          <TokenCard />
          <DaysLeft />
        </div>
      </div>
      <Separator className="h-1 bg-gray-200" />
      <div className="flex flex-wrap items-center justify-center gap-12">
        <ProgressChart />
        <DaftarPilihan />
      </div>
      <Separator className="h-1 bg-gray-200" />
      <JadwalKegiatan />
      <Separator className="h-1 bg-gray-200" />
      <TryOutTerbaru />
      <Separator className="h-1 bg-gray-200" />
      <RekamanTerbaru />
    </div>
  );
}
