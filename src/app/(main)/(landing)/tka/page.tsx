"use client";

import { api, RouterOutputs } from "~/trpc/react";
import ErrorPage from "~/app/error";
import LoadingPage from "~/app/loading";
import { Separator } from "~/app/_components/ui/separator";
import TryOutTersedia from "../tryout-tersedia";
import { type TryOutData } from "~/app/_components/tryout-card";
import VideoMateri from "../../../_components/video-materi";
import InformasiUtama from "./informasi-utama";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { toast } from "sonner";

// Define the type using tRPC's inferred types
type TryoutPackage = RouterOutputs["package"]["getTryoutPackages"][number];

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
    refetch,
  } = api.package.getTryoutPackages.useQuery({});

  const purchaseTryOutMutation = api.package.purchasePackage.useMutation();

  const handlePurchase = async (tryOutId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      purchaseTryOutMutation.mutate(
        { packageId: tryOutId },
        {
          onSuccess: () => {
            refetch(); // Refetch the data to update the UI
            resolve();
          },
          onError: (error) => {
            reject(error);
          },
        },
      );
    });
  };

  const convertPackageToTryOutData = (
    pkg: TryoutPackage,
    index: number,
  ): TryOutData => {
    const status = getPackageStatus(pkg);
    const packageNumber = index + 1;

    return {
      id: pkg.id,
      title: pkg.name,
      subtitle: `Try Out #${packageNumber}`,
      dateRange:
        pkg.TOstart && pkg.TOend
          ? `${new Date(pkg.TOstart).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
            })} - ${new Date(pkg.TOend).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}`
          : "Tanggal belum ditentukan",
      isEnded: new Date(pkg.TOend) < new Date(),
      status: status.type,
      number: packageNumber.toString(),
      participants: 0,
      difficulty: "medium",
      tokenPrice: pkg.tokenPrice, // Include tokenPrice for purchase dialog
    };
  };

  const getPackageStatus = (pkg: TryoutPackage) => {
    const isPackageEndDatePassed = new Date(pkg.TOend) < new Date();
    const isPackageStarted = new Date(pkg.TOstart) <= new Date();

    const isPurchased = pkg.userPackage?.length > 0;
    const isCompleted = pkg.quizSession?.length > 0;

    if (isCompleted) {
      return {
        type: "completed" as const,
      };
    } else if (isPurchased && isPackageStarted) {
      return {
        type: "available" as const,
      };
    } else if (isPurchased && !isPackageStarted) {
      return {
        type: "upcoming" as const,
      };
    } else {
      return {
        type: "unpurchased" as const,
      };
    }
  };

  const tkaTryOuts: TryOutData[] =
    tkaTryOutsRaw?.map((pkg, index) =>
      convertPackageToTryOutData(pkg, index),
    ) || [];

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

  const handleCardClick = (pkg: TryoutPackage) => {
    const status = getPackageStatus(pkg);

    if (status.type === "completed") {
      router.push(`/tryout/${pkg.id}/scores`);
    } else if (status.type === "upcoming") {
      toast.info(
        "Tryout akan dimulai pada " + new Date(pkg.TOstart).toLocaleString(),
      );
    } else if (status.type === "available") {
      router.push(`/tryout/${pkg.id}`);
    }
    // Note: Purchase case is now handled directly by TryOutCard component
  };

  const handleTryOutClick = (tryOut: TryOutData) => {
    const pkg = tkaTryOutsRaw?.find((p) => p.id === tryOut.id);
    if (pkg) {
      handleCardClick(pkg);
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
      <TryOutTersedia
        tryOuts={tkaTryOuts}
        onTryOutClick={handleTryOutClick}
        onPurchase={handlePurchase}
      />
    </div>
  );
}
