"use client";

import { api } from "~/trpc/react";
import ErrorPage from "~/app/error";
import LoadingPage from "~/app/loading";
import { Separator } from "~/app/_components/ui/separator";
import TryOutTersedia from "../tryout-tersedia";
import { type TryOutData } from "~/app/_components/tryout-card";
import VideoMateri from "../../../_components/video-materi";
import InformasiUtama from "./informasi-utama";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

// const tkaTryOuts: TryOutData[] = [
//   {
//     id: 4,
//     title: "Try Out TKA Saintek 2026",
//     subtitle: "Try Out #1",
//     dateRange: "20 November - 27 November 2025",
//     status: "available",
//     number: "1",
//     participants: 800,
//     difficulty: "hard",
//   },
//   {
//     id: 5,
//     title: "Try Out TKA Soshum 2026",
//     subtitle: "Try Out #2",
//     dateRange: "28 November - 5 Desember 2025",
//     status: "ongoing",
//     number: "2",
//     participants: 650,
//     difficulty: "medium",
//   },
//   {
//     id: 6,
//     title: "Try Out TKA Saintek 2026",
//     subtitle: "Try Out #3",
//     dateRange: "10 Oktober - 17 Oktober 2025",
//     status: "finished",
//     number: "3",
//     participants: 720,
//     difficulty: "hard",
//   },
// ];

export default function MainPage() {
  const router = useRouter();
  // const [content, setContent] = useState<string>("");

  const { data: session, status } = useSession();

  // const {
  //   data: announcement,
  //   isLoading: announcementLoading,
  //   isError: announcementError,
  //   refetch: refetchAnnouncement,
  // } = api.quiz.getAnnouncement.useQuery();

  const {
    data: tkaTryOutsRaw,
    isLoading: tryoutLoading,
    isError: tryoutError,
  } = api.package.getTryoutPackages.useQuery({});

  // Transform API data to TryOutData format
  const tkaTryOuts: TryOutData[] =
    tkaTryOutsRaw?.map((pkg, index) => ({
      id: pkg.id || "",
      title: pkg.name || "TKA Try Out",
      subtitle: `Try Out #${index + 1}`,
      dateRange: pkg.createdAt
        ? new Date(pkg.createdAt).toLocaleDateString()
        : "TBA",
      status: "available" as const,
      number: (index + 1).toString(),
      participants: pkg.quizSession?.length || 0,
      difficulty: "medium" as const,
    })) || [];

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
      case "available":
        router.push(`/tryout/${tryOut.id}`);
        break;
      case "ongoing":
        router.push(`/tryout/${tryOut.id}`);
        break;
      case "finished":
        router.push(`/tryout/${tryOut.id}/scores`);
        break;
      default:
        break;
    }
  };

  if (status == "loading") {
    return <LoadingPage />;
  }
  return tryoutError ? (
    <ErrorPage />
  ) : tryoutLoading ? (
    <LoadingPage />
  ) : (
    <div className="flex size-full flex-col gap-4">
      {/* <Separator className="h-1 bg-gray-200" /> */}
      <InformasiUtama />
      <VideoMateri />
      <Separator className="h-1 bg-gray-200" />
      <TryOutTersedia tryOuts={tkaTryOuts} onTryOutClick={handleTryOutClick} />
    </div>
  );
}
