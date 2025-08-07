"use client";

import { api } from "~/trpc/react";
import ErrorPage from "~/app/error";
import LoadingPage from "~/app/loading";
import { useState } from "react";
import RekamanTerbaru from "./rekaman-terbaru";
import JadwalKegiatan from "./jadwal-kegiatan";
import TryOutTersedia from "../tryout-tersedia";
import { type TryOutData } from "~/app/_components/tryout-card";
import DaftarPilihan from "./daftar-pilihan";
import ProgressChart from "./progress-chart";
import { Separator } from "~/app/_components/ui/separator";
import { useRouter } from "next/navigation";

const utbkTryOuts: TryOutData[] = [
  {
    id: 1,
    title: "Try Out UTBK SNBT 2026",
    subtitle: "Try Out #1",
    dateRange: "23 November - 30 November 2025",
    status: "available",
    number: "1",
    participants: 1250,
    difficulty: "medium",
  },
  {
    id: 2,
    title: "Try Out UTBK SNBT 2026",
    subtitle: "Try Out #2", 
    dateRange: "1 Desember - 7 Desember 2025",
    status: "ongoing",
    number: "2",
    participants: 850,
    difficulty: "hard",
  },
  {
    id: 3,
    title: "Try Out UTBK SNBT 2026",
    subtitle: "Try Out #3",
    dateRange: "15 Oktober - 22 Oktober 2025", 
    status: "finished",
    number: "3",
    participants: 950,
    difficulty: "medium",
  },
];


export default function MainPage() {
  const router = useRouter();
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

  const handleTryOutClick = (tryOut: TryOutData) => {
    switch (tryOut.status) {
      case 'available':
        router.push(`/tryout/${tryOut.id}`);
        break;
      case 'ongoing':
        router.push(`/tryout/${tryOut.id}`);
        break;
      case 'finished':
        router.push(`/tryout/${tryOut.id}/scores`);
        break;
      default:
        break;
    }
  };

  return sessionError || announcementError ? (
    <ErrorPage />
  ) : sessionLoading || announcementLoading ? (
    <LoadingPage />
  ) : (
    <div className="flex size-full flex-col gap-4">
      {/* <Separator className="h-1 bg-gray-200" /> */}
      <div className="flex flex-wrap items-center justify-center gap-12">
        <ProgressChart />
        <DaftarPilihan />
      </div>
      <Separator className="h-1 bg-gray-200" />
      <JadwalKegiatan />
      <Separator className="h-1 bg-gray-200" />
      <TryOutTersedia tryOuts={utbkTryOuts} onTryOutClick={handleTryOutClick} />
      <Separator className="h-1 bg-gray-200" />
      <RekamanTerbaru />
    </div>
  );
}
