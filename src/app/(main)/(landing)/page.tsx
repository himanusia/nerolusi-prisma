"use client";

import { api } from "~/trpc/react";
import ErrorPage from "~/app/error";
import LoadingPage from "~/app/loading";
import { Separator } from "~/app/_components/ui/separator";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MainPage() {
  // const [content, setContent] = useState<string>("");
  const router = useRouter();

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

  useEffect(() => {
    router.push("/tka");
  }, [router]);

  return sessionError || announcementError ? (
    <ErrorPage />
  ) : sessionLoading || announcementLoading ? (
    <LoadingPage />
  ) : (
    <div className="flex size-full flex-col gap-4">      
      <Separator className="h-1 bg-gray-200" />
      {/* <div className="flex flex-wrap items-center justify-center gap-12">
        <ProgressChart />
        <DaftarPilihan />
      </div>
      <Separator className="h-1 bg-gray-200" />
      <JadwalKegiatan />
      <Separator className="h-1 bg-gray-200" />
      <TryOutTerbaru />
      <Separator className="h-1 bg-gray-200" />
      <RekamanTerbaru /> */}
    </div>
  );
}
