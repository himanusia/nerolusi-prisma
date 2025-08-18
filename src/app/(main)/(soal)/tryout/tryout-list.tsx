"use client";

import ErrorPage from "~/app/error";
import LoadingPage from "~/app/loading";
import { api, RouterOutputs } from "~/trpc/react";
import { useRouter } from "next/navigation";
import TryOutCard, { type TryOutData } from "~/app/_components/tryout-card";
import { toast } from "sonner";

interface TryoutListProps {
  classId?: number;
}

// Define the type using tRPC's inferred types (recommended approach)
type TryoutPackage = RouterOutputs["package"]["getTryoutPackages"][number];

const TryoutList = ({ classId }: TryoutListProps) => {
  const router = useRouter();

  const {
    data: packages,
    isLoading,
    isError,
    refetch,
  } = api.package.getTryoutPackages.useQuery({ classId });

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

    let tryOutStatus: TryOutData["status"];
    switch (status.type) {
      case "completed":
        tryOutStatus = "finished";
        break;
      case "purchased":
        tryOutStatus = "available";
        break;
      case "expired":
        tryOutStatus = "expired";
        break;
      default:
        tryOutStatus = "upcoming";
        break;
    }

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
      status: tryOutStatus,
      number: packageNumber.toString(),
      participants: 0,
      difficulty: "medium",
      token: status.showCoin ? status.cost : undefined,
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
        bgColor: "bg-green-500",
        textColor: "text-white",
        buttonText: "Lihat Hasil",
        showArrow: false,
        showCoin: false,
      };
    } else if (isPackageEndDatePassed) {
      return {
        type: "expired" as const,
        bgColor: "bg-gray-500",
        textColor: "text-white",
        buttonText: "Terlewat",
        showArrow: false,
        showCoin: false,
      };
    } else if (isPurchased && isPackageStarted) {
      return {
        type: "purchased" as const,
        bgColor: "bg-white",
        textColor: "text-black",
        buttonText: "Mulai",
        showArrow: true,
        showCoin: false,
      };
    } else {
      return {
        type: "unpurchased" as const,
        bgColor: "bg-white",
        textColor: "text-black",
        buttonText: "Beli",
        showArrow: false,
        showCoin: true,
        cost: pkg.tokenPrice ?? 1,
      };
    }
  };

  const handleCardClick = (pkg: TryoutPackage) => {
    const status = getPackageStatus(pkg);

    if (status.type === "completed") {
      router.push(`/tryout/${pkg.id}/scores`);
    } else if (status.type === "expired") {
      toast.info("Waktu pengerjaan tryout ini telah berakhir");
    } else if (status.type === "purchased") {
      router.push(`/tryout/${pkg.id}`);
    }
    // Note: Purchase case is now handled directly by TryOutCard component
  };

  const handleTryOutClick = (tryOut: TryOutData) => {
    const pkg = packages?.find((p) => p.id === tryOut.id);
    if (pkg) {
      handleCardClick(pkg);
    }
  };

  return isError ? (
    <ErrorPage />
  ) : isLoading ? (
    <LoadingPage />
  ) : (
    <>
      {/* Try Out Cards Section */}
      <div className="flex w-full flex-col items-start space-y-4">
        <div className="flex flex-col items-start justify-between">
          <h3 className="text-left text-xl font-bold text-gray-900">
            Try Out Tersedia
          </h3>
          <p className="text-gray-600">
            Kerjakan Try Out mu untuk melihat hasil belajarmu!
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {packages?.map((pkg, index) => {
            const tryOutData = convertPackageToTryOutData(pkg, index);

            return (
              <TryOutCard
                key={pkg.id}
                tryOut={tryOutData}
                onTryOutClick={handleTryOutClick}
                onPurchase={handlePurchase}
              />
            );
          })}
        </div>

        {packages?.length === 0 && (
          <div className="py-12 text-start text-gray-500">
            <svg
              className="mx-auto mb-4 h-16 w-16 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-lg font-medium">
              Tidak ada try out yang tersedia
            </p>
            <p className="text-sm">
              Try out akan muncul di sini ketika tersedia
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default TryoutList;
