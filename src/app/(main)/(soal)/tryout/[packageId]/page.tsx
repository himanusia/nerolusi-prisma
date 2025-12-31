"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import ErrorPage from "~/app/error";
import LoadingPage from "~/app/loading";
import { api } from "~/trpc/react";
import { TryoutHeader } from "./_components/tryout-header";
import { ProgressCircle } from "./_components/progress-circle";
import { SubtestListItem } from "./_components/subtest-list-item";
import { SubtestInfoPanel } from "./_components/subtest-info-panel";
import { SubtestDialog } from "./_components/subtest-dialog";
import { CountdownTimer } from "./_components/countdown-timer";
import { StartConfirmationDialog } from "./_components/start-confirmation-dialog";
import {
  sortSubtests,
  isSubtestCompleted,
  getCompletedCount,
  getSubtestDisplayName,
} from "./_components/subtest-utils";

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
  const [selectedSubtest, setSelectedSubtest] = useState<any>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingStart, setPendingStart] = useState<{
    subtestId: string;
    duration: number;
    subtestName: string;
    questionCount: number;
  } | null>(null);

  const {
    data: packageData,
    isLoading,
    isError,
    error,
    refetch: refetchPackageData,
  } = api.quiz.getPackageWithSubtest.useQuery(
    { id: packageIdString },
    {
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      staleTime: 0,
      gcTime: 0,
    },
  );

  const sortedSubtests = packageData?.subtests
    ? sortSubtests(packageData.subtests)
    : [];

  const completedCount = getCompletedCount(sortedSubtests);
  const allSubtestsCompleted = completedCount === sortedSubtests.length;
  const isPackageEndDatePassed =
    new Date(packageData?.TOend || new Date()) < new Date();

  // Redirect if all completed and not expired
  React.useEffect(() => {
    if (
      packageData &&
      allSubtestsCompleted &&
      sortedSubtests.length > 0 &&
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

  // Refetch on visibility change
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

  const handleSubtestDialogClick = (subtest: any, index: number) => {
    const isSubmitted = isSubtestCompleted(subtest);
    const isCurrentSubtest = index === completedCount && !isSubmitted;

    if (isSubmitted || isCurrentSubtest) {
      setSelectedSubtest(subtest);
      setDialogOpen(true);
    }
  };

  const handleSubtestClick = async (subtestId: string, duration: number) => {
    // Find the subtest to get its name and question count
    const subtest = sortedSubtests.find((s) => s.id === subtestId);
    if (!subtest) return;

    const subtestName = getSubtestDisplayName(subtest.type || "");
    const questionCount = subtest._count?.questions || 0;

    // Show confirmation dialog first
    setPendingStart({
      subtestId,
      duration,
      subtestName: subtestName.full,
      questionCount,
    });
    setConfirmDialogOpen(true);
  };

  const handleConfirmStart = async () => {
    if (!pendingStart) return;

    if (!session.data || !session.data.user) {
      toast.error("Anda harus login terlebih dahulu");
      return;
    }

    const userId = session.data.user.id;

    try {
      let quizSession;

      quizSession = await getSessionMutation.mutateAsync({
        userId,
        subtestId: pendingStart.subtestId,
      });

      if (!quizSession) {
        quizSession = await startSessionMutation.mutateAsync({
          userId,
          packageId: packageIdString,
          subtestId: pendingStart.subtestId,
          duration: pendingStart.duration ?? 10000,
        });
      }

      router.push(`/quiz/${quizSession.id}`);
    } catch (error) {
      console.error(error);
      toast.error("Error creating session", {
        description: (error as Error).message,
      });
    } finally {
      setPendingStart(null);
    }
  };

  const handleViewResults = async (subtestId: string) => {
    if (!session.data || !session.data.user) {
      toast.error("Anda harus login terlebih dahulu");
      return;
    }

    const userId = session.data.user.id;

    if (isPackageEndDatePassed) {
      try {
        const quizSession = await getSessionMutation.mutateAsync({
          userId,
          subtestId,
        });

        if (quizSession) {
          router.push(`/quiz/${quizSession.id}`);
        } else {
          toast.error("No completed session found for this subtest");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error retrieving session", {
          description: (error as Error).message,
        });
      }
    } else {
      toast.info("Pembahasan akan tersedia setelah tryout berakhir");
    }
  };

  const handleTimerExpire = () => {
    toast.info("Tryout telah berakhir. Pembahasan sekarang tersedia.");
    refetchPackageData();
    if (allSubtestsCompleted) {
      router.push(`/tryout/${packageId}/scores`);
    }
  };

  if (isError) {
    toast.error("Error loading tryout data", {
      description: error?.message,
    });
    return <ErrorPage />;
  }

  if (isLoading) {
    return <LoadingPage />;
  }

  const currentSubtest = sortedSubtests[completedCount];

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Panel */}
      <div className="w-full border-[1px] border-[#acaeba] px-10 py-5 md:w-1/3">
        <TryoutHeader
          packageName={packageData.name}
          startDate={packageData.TOstart}
          endDate={packageData.TOend}
          onBack={() => router.push("/tryout")}
        />

        {!isPackageEndDatePassed && packageData.TOend && (
          <CountdownTimer
            endDate={packageData.TOend}
            onExpire={handleTimerExpire}
          />
        )}

        <ProgressCircle
          completed={completedCount}
          total={sortedSubtests.length}
        />

        {/* Subtest List */}
        <div className="space-y-2">
          {sortedSubtests.map((subtest, index) => {
            const isSubmitted = isSubtestCompleted(subtest);
            const isCurrentSubtest = index === completedCount && !isSubmitted;

            return (
              <SubtestListItem
                key={subtest.id}
                subtest={subtest}
                isSubmitted={isSubmitted}
                isCurrentSubtest={isCurrentSubtest}
                isPackageEndDatePassed={isPackageEndDatePassed}
                onClick={() => {
                  if (window.innerWidth >= 768) {
                    if (isSubmitted) {
                      handleViewResults(subtest.id);
                    } else if (isCurrentSubtest) {
                      handleSubtestClick(subtest.id, subtest.duration);
                    }
                  } else {
                    handleSubtestDialogClick(subtest, index);
                  }
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Right Panel */}
      <div className="hidden w-2/3 items-center justify-center bg-[#2b8057]/30 p-8 md:flex">
        <SubtestInfoPanel
          currentSubtest={currentSubtest}
          isPackageEndDatePassed={isPackageEndDatePassed}
          packageEndDate={packageData.TOend}
          onStartSubtest={handleSubtestClick}
          onViewScores={() => router.push(`/tryout/${packageId}/scores`)}
        />
      </div>

      <SubtestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        subtest={selectedSubtest}
        isSubmitted={
          selectedSubtest ? isSubtestCompleted(selectedSubtest) : false
        }
        isPackageEndDatePassed={isPackageEndDatePassed}
        packageEndDate={packageData.TOend}
        onStartSubtest={handleSubtestClick}
        onViewResults={handleViewResults}
      />

      <StartConfirmationDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        subtestName={pendingStart?.subtestName || ""}
        duration={pendingStart?.duration || 0}
        questionCount={pendingStart?.questionCount || 0}
        onConfirm={handleConfirmStart}
      />
    </div>
  );
}
