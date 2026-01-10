"use client";

import { api, RouterOutputs } from "~/trpc/react";
import ErrorPage from "~/app/error";
import LoadingPage from "~/app/loading";
import RekamanTerbaru from "./rekaman-terbaru";
import JadwalKegiatan from "./jadwal-kegiatan";
import TryOutTersedia from "../tryout-tersedia";
import { type TryOutData } from "~/app/_components/tryout-card";
import DaftarPilihan from "./daftar-pilihan";
import ProgressChart from "./progress-chart";
import { Separator } from "~/app/_components/ui/separator";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import ModulPage from "../../modul/utbk/page";
import { Button } from "~/app/_components/ui/button";
import Link from "next/link";

// Define the type using tRPC's inferred types
type TryoutPackage = RouterOutputs["package"]["getTryoutPackages"][number];

export default function MainPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const {
    data: utbkTryOutsRaw,
    isLoading: tryoutLoading,
    isError: tryoutError,
    refetch,
  } = api.package.getTryoutPackages.useQuery({ isTka: false });

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
      mode: pkg.mode ?? "utbk",
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

  const utbkTryOuts: TryOutData[] =
    utbkTryOutsRaw?.map((pkg, index) =>
      convertPackageToTryOutData(pkg, index),
    ) || [];

  const handleCardClick = (pkg: TryoutPackage) => {
    const status = getPackageStatus(pkg);

    if (status.type === "completed") {
      router.push(`/tryout/${pkg.id}/scores`);
    } else if (status.type === "upcoming") {
      toast.info(
        "Tryout akan dimulai pada " + new Date(pkg.TOstart).toLocaleString(),
      );
    } else if (status.type === "available" || !pkg.tokenPrice) {
      router.push(`/tryout/${pkg.id}`);
    }
    // Note: Purchase case is now handled directly by TryOutCard component
  };

  const handleTryOutClick = (tryOut: TryOutData) => {
    const pkg = utbkTryOutsRaw?.find((p) => p.id === tryOut.id);
    if (pkg) {
      handleCardClick(pkg);
    }
  };

  if (status === "loading") {
    return <LoadingPage />;
  }

  return tryoutError ? (
    <ErrorPage />
  ) : tryoutLoading ? (
    <LoadingPage />
  ) : (
    <div className="flex size-full flex-col gap-4">
      {/* <Separator className="h-1 bg-gray-200" /> */}
      <div className="flex justify-center">
        <Link href="https://docs.google.com/forms/d/e/1FAIpQLSegQoAdEqQnzWtFeWvYDyF0ukS1Rt-84Tex_qNwFWEux2eEAw/viewform" target="_blank" rel="noopener noreferrer">
          <Button 
            size="lg"
            variant="outline"
            className="font-bold"
          >
            Daftar Free Tryout #1
          </Button>
        </Link>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-12">
        <ProgressChart />
        <DaftarPilihan />
      </div>
      <Separator className="h-1 bg-gray-200" />
      <ModulPage />
      <Separator className="h-1 bg-gray-200" />
      <JadwalKegiatan />
      <Separator className="h-1 bg-gray-200" />
      <TryOutTersedia
        tryOuts={utbkTryOuts}
        onTryOutClick={handleTryOutClick}
        onPurchase={handlePurchase}
      />
      <Separator className="h-1 bg-gray-200" />
      <RekamanTerbaru />
    </div>
  );
}
