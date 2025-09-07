"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "~/app/_components/ui/button";
import ErrorPage from "~/app/error";
import LoadingPage from "~/app/loading";
import { api } from "~/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "~/app/_components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";

export default function TryOutPage() {
  const { packageId } = useParams();
  const packageIdString = Array.isArray(packageId)
    ? (packageId[0] ?? "")
    : packageId;
  const startSessionMutation = api.quiz.createSession.useMutation();
  const getSessionMutation = api.quiz.getSession.useMutation();
  const router = useRouter();
  const session = useSession();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSubtest, setSelectedSubtest] = useState(null);

  const handleSubtestDialogClick = (subtest, index) => {
    const isSubmitted =
      subtest.quizSession?.[0]?.endTime &&
      new Date(subtest.quizSession[0].endTime) <= new Date();
    const completedCount =
      sortedSubtests?.filter(
        (s) =>
          s.quizSession?.[0]?.endTime &&
          new Date(s.quizSession[0]?.endTime) <= new Date(),
      ).length || 0;
    const isCurrentSubtest = index === completedCount && !isSubmitted;

    if (isSubmitted || isCurrentSubtest) {
      setSelectedSubtest(subtest);
      setDialogOpen(true);
    }
  };

  const getSubtestDisplayName = (type: string) => {
    switch (type) {
      case "pu":
        return "Kemampuan Penalaran Umum";
      case "ppu":
        return "Pengetahuan dan Pemahaman Umum";
      case "pbm":
        return "Kemampuan Memahami Bacaan dan Menulis";
      case "pk":
        return "Pengetahuan Kuantitatif";
      case "lbi":
        return "Literasi dalam Bahasa Indonesia";
      case "lbe":
        return "Literasi dalam Bahasa Inggris";
      case "pm":
        return "Penalaran Matematika";
      default:
        return type
          .replace("_", " ")
          .split(" ")
          .map(
            (word) =>
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
          )
          .join(" ");
    }
  };

  const {
    data: packageData,
    isLoading,
    isError,
    refetch: refetchPackageData,
  } = api.quiz.getPackageWithSubtest.useQuery(
    { id: packageIdString },
    {
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      staleTime: 0, // Always consider data stale to ensure fresh fetch
      gcTime: 0, // Don't cache the data
    },
  );

  const subtestOrder = ["pu", "ppu", "pbm", "pk", "lbi", "lbe", "pm"];

  const sortedSubtests = packageData?.subtests?.sort((a, b) => {
    const indexA = subtestOrder.indexOf(a.type);
    const indexB = subtestOrder.indexOf(b.type);
    return indexA - indexB;
  });

  // Check if all subtests are completed
  const completedCount =
    sortedSubtests?.filter(
      (s) =>
        s.quizSession?.[0]?.endTime &&
        new Date(s.quizSession[0]?.endTime) <= new Date(),
    ).length || 0;
  const allSubtestsCompleted = completedCount === sortedSubtests?.length;
  const isPackageEndDatePassed =
    new Date(packageData?.TOend || new Date()) < new Date();

  // If all subtests are completed but end date hasn't passed, redirect to scores page
  React.useEffect(() => {
    if (
      packageData &&
      allSubtestsCompleted &&
      sortedSubtests?.length > 0 &&
      !isPackageEndDatePassed
    ) {
      toast.info(
        "Semua subtest telah diselesaikan. Pembahasan akan tersedia setelah tryout berakhir.",
      );
      router.push(`/tryout/${packageId}/scores`);
    }
  }, [
    packageData,
    allSubtestsCompleted,
    sortedSubtests,
    isPackageEndDatePassed,
    router,
    packageId,
  ]);

  // Refetch data when page becomes visible again (e.g., when coming back from quiz page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refetchPackageData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [refetchPackageData]);

  return isError ? (
    <ErrorPage />
  ) : isLoading ? (
    <LoadingPage />
  ) : (
    <div className="flex min-h-screen bg-white">
      {/* Left Panel */}
      <div className="w-full border-[1px] border-[#acaeba] px-10 py-5 md:w-1/3">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => router.push("/tryout")}
          className="mb-5"
        >
          ← Kembali
        </Button>

        {/* Title */}
        <div className="mb-4 flex flex-col items-center justify-center">
          <h1 className="mb-2 text-center text-3xl font-bold text-gray-800">
            {packageData.name}
          </h1>

          {/* Date Range */}
          <div className="flex w-fit items-center gap-2 rounded-lg bg-green-100 px-4 py-2 text-green-700">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-bold">
              {new Date(packageData.TOstart).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
              })}{" "}
              -{" "}
              {new Date(packageData.TOend).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Progress Circle */}
        <div className="mb-4 flex items-center justify-center">
          <div className="relative h-32 w-32">
            <svg
              className="h-32 w-32 -rotate-90 transform"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#d4ffea"
                strokeWidth="20"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#2b8057"
                strokeWidth="20"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${(sortedSubtests?.filter((s) => s.quizSession?.[0]?.endTime && new Date(s.quizSession[0]?.endTime) <= new Date()).length / sortedSubtests?.length) * 251.2} 251.2`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-800">
                {sortedSubtests?.filter(
                  (s) =>
                    s.quizSession?.[0]?.endTime &&
                    new Date(s.quizSession[0]?.endTime) <= new Date(),
                ).length || 0}
                /{sortedSubtests?.length || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Subtest List */}
        <div className="space-y-2">
          {sortedSubtests?.map((subtest, index) => {
            const isSubmitted =
              subtest.quizSession?.[0]?.endTime &&
              new Date(subtest.quizSession[0].endTime) <= new Date();
            const completedCount =
              sortedSubtests?.filter(
                (s) =>
                  s.quizSession?.[0]?.endTime &&
                  new Date(s.quizSession[0]?.endTime) <= new Date(),
              ).length || 0;
            const isCurrentSubtest = index === completedCount && !isSubmitted; // Next in sequence
            const isPackageEndDatePassed =
              new Date(packageData?.TOend || new Date()) < new Date();
            const allSubtestsCompleted =
              completedCount === sortedSubtests?.length;

            return (
              <Button
                key={subtest.id}
                variant={
                  isSubmitted
                    ? "default"
                    : isCurrentSubtest
                      ? "outline"
                      : "disable"
                }
                className={`h-auto min-h-10 w-full items-center justify-center whitespace-normal rounded-lg transition-all ${
                  isSubmitted || isCurrentSubtest
                    ? "cursor-pointer"
                    : "pointer-events-none"
                }`}
                onClick={() => {
                  if (window.innerWidth >= 768) {
                    if (isSubmitted) {
                      // Navigate to view results
                      handleViewResults(subtest.id);
                    } else if (isCurrentSubtest) {
                      // Start new session
                      handleSubtestClick(subtest.id, subtest.duration);
                    }
                  } else {
                    handleSubtestDialogClick(subtest, index);
                  }
                }}
              >
                <div className="w-full text-center">
                  <div className="text-md font-bold">
                    {(() => {
                      switch (subtest.type) {
                        case "pu":
                          return "Kemampuan Penalaran Umum";
                        case "ppu":
                          return "Pengetahuan dan Pemahaman Umum";
                        case "pbm":
                          return "Kemampuan Memahami Bacaan dan Menulis";
                        case "pk":
                          return "Pengetahuan Kuantitatif";
                        case "lbe":
                          return "Literasi dalam Bahasa Inggris";
                        case "lbi":
                          return "Literasi dalam Bahasa Indonesia";
                        case "pm":
                          return "Penalaran Matematika";
                        default:
                          return subtest.type
                            .replace("_", " ")
                            .split(" ")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() +
                                word.slice(1).toLowerCase(),
                            )
                            .join(" ");
                      }
                    })()}
                  </div>
                  {isPackageEndDatePassed &&
                    isSubmitted &&
                    (subtest.quizSession?.[0]?.score !== null ||
                      subtest.quizSession?.[0]?.score !== undefined) && (
                      <div className="text-sm opacity-90">
                        Score: {subtest.quizSession[0].score} |{" "}
                        {subtest.quizSession[0].numCorrect}/
                        {subtest.quizSession[0].numQuestion}
                      </div>
                    )}
                  {/* {isSubmitted && (
                    <div className="text-xs text-blue-600 mt-1">
                      {isPackageEndDatePassed 
                        ? "Klik untuk melihat pembahasan" 
                        : "Sudah selesai - Pembahasan tersedia setelah tryout berakhir"}
                    </div> */}
                  {/* )} */}
                </div>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Right Panel */}
      <div className="hidden w-2/3 items-center justify-center bg-[#2b8057]/30 p-8 md:flex">
        <div className="w-full max-w-md rounded-sm border-[1px] border-[#acaeba] bg-white p-5 text-center">
          {(() => {
            const completedCount =
              sortedSubtests?.filter(
                (s) =>
                  s.quizSession?.[0]?.endTime &&
                  new Date(s.quizSession[0]?.endTime) <= new Date(),
              ).length || 0;
            const currentSubtest = sortedSubtests?.[completedCount]; // Next in sequence

            if (currentSubtest) {
              const subtestName = (() => {
                switch (currentSubtest.type) {
                  case "pu":
                    return { short: "PU", full: "Kemampuan Penalaran Umum" };
                  case "ppu":
                    return {
                      short: "PPU",
                      full: "Pengetahuan dan Pemahaman Umum",
                    };
                  case "pbm":
                    return {
                      short: "PBM",
                      full: "Kemampuan Memahami Bacaan dan Menulis",
                    };
                  case "pk":
                    return { short: "PK", full: "Pengetahuan Kuantitatif" };
                  case "lbi":
                    return {
                      short: "LBI",
                      full: "Literasi dalam Bahasa Indonesia",
                    };
                  case "lbe":
                    return {
                      short: "LBE",
                      full: "Literasi dalam Bahasa Inggris",
                    };
                  case "pm":
                    return { short: "PM", full: "Penalaran Matematika" };
                  default:
                    return {
                      short: "",
                      full: String(currentSubtest.type)
                        .replace("_", " ")
                        .split(" ")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() +
                            word.slice(1).toLowerCase(),
                        )
                        .join(" "),
                    };
                }
              })();

              return (
                <>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Sudah siap?
                  </h2>
                  <h3 className="text-2xl font-bold text-gray-700">
                    {subtestName.short}
                  </h3>
                  <p className="mb-2 text-gray-600">{subtestName.full}</p>

                  <div className="mb-2 flex flex-col items-center justify-center gap-2">
                    <div className="flex items-center gap-2">
                      <svg
                        className="h-5 w-5 text-gray-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-semibold">{currentSubtest._count.questions ?? "?"} Soal</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <svg
                        className="h-5 w-5 text-gray-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-semibold">
                        {currentSubtest.duration} Menit
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="default"
                    className="text-md font-normal"
                    onClick={() =>
                      handleSubtestClick(
                        currentSubtest.id,
                        currentSubtest.duration,
                      )
                    }
                  >
                    Start!
                  </Button>
                </>
              );
            } else {
              // All subtests completed
              const isPackageEndDatePassed =
                new Date(packageData.TOend) < new Date();

              return (
                <>
                  <h3 className="mb-2 text-xl font-bold text-green-700">
                    Selesai! 🎉
                  </h3>
                  <p className="mb-6 text-gray-600">
                    Semua subtest telah diselesaikan
                  </p>

                  {isPackageEndDatePassed ? (
                    <Button
                      variant="default"
                      className="text-md mb-4 bg-[#2b8057] font-normal hover:bg-[#2b8057]/80"
                      onClick={() => router.push(`/tryout/${packageId}/scores`)}
                    >
                      Lihat Hasil
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      className="text-md mb-4 bg-[#2b8057] font-normal hover:bg-[#2b8057]/80"
                      onClick={() => router.push(`/tryout/${packageId}/scores`)}
                    >
                      Lihat Status
                    </Button>
                  )}

                  {!isPackageEndDatePassed && (
                    <div className="mt-2 text-sm text-gray-500">
                      <p>Skor detail akan tersedia setelah:</p>
                      <p className="font-semibold">
                        {new Date(packageData.TOend).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  )}
                </>
              );
            }
          })()}
        </div>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[350px] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center">
              {selectedSubtest &&
                (() => {
                  const isSubmitted =
                    selectedSubtest.quizSession &&
                    new Date(selectedSubtest.quizSession) <= new Date();
                  const subtestName = getSubtestDisplayName(
                    selectedSubtest.type,
                  );

                  if (isSubmitted) {
                    const isPackageEndDatePassed =
                      new Date(packageData.TOend) < new Date();
                    return isPackageEndDatePassed ? (
                      <p className="text-2xl font-bold text-black">
                        Lihat Pembahasan
                      </p>
                    ) : (
                      <p className="text-2xl font-bold text-black">
                        Subtest Selesai
                      </p>
                    );
                  } else {
                    return (
                      <p className="text-2xl font-bold text-black">
                        Sudah siap?
                      </p>
                    );
                  }
                })()}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-center">
            {selectedSubtest &&
              (() => {
                const isSubmitted =
                  selectedSubtest.quizSession?.[0] &&
                  new Date(selectedSubtest.quizSession[0].endTime) <=
                    new Date();
                const subtestName = getSubtestDisplayName(selectedSubtest.type);
                const isPackageEndDatePassed =
                  new Date(packageData.TOend) < new Date();

                if (isSubmitted) {
                  return (
                    <>
                      <div>
                        <h3 className="-mt-4 text-2xl font-bold text-black">
                          {selectedSubtest.type.toUpperCase()}
                        </h3>
                        <p className="text-gray-600">{subtestName}</p>
                        {selectedSubtest.quizSession?.[0]?.score && (
                          <p className="text-lg font-semibold text-green-600">
                            Score: {selectedSubtest.quizSession[0].score} |{" "}
                            {selectedSubtest.quizSession[0].numCorrect}/
                            {selectedSubtest.quizSession[0].numQuestion}
                          </p>
                        )}
                      </div>

                      {isPackageEndDatePassed ? (
                        <Button
                          variant="default"
                          className="max-w-lg"
                          onClick={() => {
                            setDialogOpen(false);
                            handleViewResults(selectedSubtest.id);
                          }}
                        >
                          Lihat Pembahasan
                        </Button>
                      ) : (
                        <div className="text-sm text-gray-500">
                          <p>Pembahasan akan tersedia setelah:</p>
                          <p className="font-semibold">
                            {new Date(packageData.TOend).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      )}
                    </>
                  );
                } else {
                  return (
                    <>
                      <div>
                        <p className="-mt-4 text-2xl font-bold text-black">
                          {selectedSubtest.type.toUpperCase()}
                        </p>
                        <p className="text-gray-600">{subtestName}</p>

                        <div className="flex flex-col items-center gap-2">
                          <div className="flex items-center gap-2">
                            <svg
                              className="h-5 w-5 text-gray-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="font-semibold">{selectedSubtest.quizSession[0].numQuestion} Soal</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <svg
                              className="h-5 w-5 text-gray-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="font-semibold">
                              {selectedSubtest.duration} Menit
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="default"
                        className="max-w-md font-normal"
                        onClick={() => {
                          setDialogOpen(false);
                          handleSubtestClick(
                            selectedSubtest.id,
                            selectedSubtest.duration,
                          );
                        }}
                      >
                        Start!
                      </Button>
                    </>
                  );
                }
              })()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  async function handleSubtestClick(subtestId: string, duration: number) {
    if (!session.data || !session.data.user) {
      toast.error("Anda harus login terlebih dahulu");
      return;
    }

    const userId = session.data.user.id;

    try {
      let quizSession;

      quizSession = await getSessionMutation.mutateAsync({
        userId,
        subtestId,
      });

      if (!quizSession) {
        quizSession = await startSessionMutation.mutateAsync({
          userId,
          packageId: packageIdString,
          subtestId,
          duration: duration ?? 10000,
        });
      }

      router.push(`/quiz/${quizSession.id}`);
    } catch (error) {
      console.error(error);
      toast.error("Error creating session", {
        description: error.message,
      });
    }
  }

  async function handleViewResults(subtestId: string) {
    if (!session.data || !session.data.user) {
      toast.error("Anda harus login terlebih dahulu");
      return;
    }

    const userId = session.data.user.id;
    const isPackageEndDatePassed =
      new Date(packageData?.TOend || new Date()) < new Date();

    if (isPackageEndDatePassed) {
      try {
        const quizSession = await getSessionMutation.mutateAsync({
          userId,
          subtestId,
        });

        if (quizSession) {
          // Navigate to the session page to view results
          router.push(`/quiz/${quizSession.id}`);
        } else {
          toast.error("No completed session found for this subtest");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error retrieving session", {
          description: error.message,
        });
      }
    } else {
      toast.info("Pembahasan akan tersedia setelah tryout berakhir");
    }
  }
}
