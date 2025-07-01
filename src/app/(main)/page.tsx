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
      <div className="flex w-full items-center justify-between py-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <img
              src={user.image}
              alt="User Avatar"
              className="size-12 rounded-full"
            />
            <h2 className="text-xl">{user.name}</h2>
          </div>
          <div className="flex rounded-lg border border-gray-500 bg-gray-300">
            <div className="flex flex-col items-center justify-center rounded-lg bg-white px-4 py-2">
              <h3 className="text-center">Token TryOut</h3>
              <div className="flex items-center justify-center">
                <img
                  src="/coinstack.png"
                  alt="Token Icon"
                  className="mb-1 size-6"
                />
                <span className="ml-1 text-gray-700">:</span>
                <span className="ml-2 text-gray-700">2</span>
              </div>
            </div>
            <div className="mx-2 flex items-center justify-center text-2xl">
              +
            </div>
          </div>
        </div>
        <div className="flex items-center rounded-lg border border-gray-300 p-2">
          <div className="flex items-center justify-center rounded-lg bg-[#2b8057] px-4 py-2 text-center text-3xl font-extrabold text-white">
            300
          </div>
          <div className="ml-3 flex flex-wrap items-center justify-start">
            <span className="text-xl"><span className="font-bold">Hari</span> hingga <span className="font-bold">UTBK</span></span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-12">
        <ProgressChart />
        <DaftarPilihan />
      </div>
      <JadwalKegiatan />
      <TryOutTerbaru />
      <RekamanTerbaru />
    </div>
  );
}
