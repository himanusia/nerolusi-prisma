"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ErrorPage from "~/app/error";
import LoadingPage from "~/app/loading";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { ScoreHeader } from "./_components/score-header";
import { UserScoreCard } from "./_components/user-score-card";
import { SubtestScoreItem } from "./_components/subtest-score-item";
import {
  getSubtestDisplayName,
  sortSubtests,
} from "../_components/subtest-utils";

export default function ScoresPage() {
  const { packageId } = useParams();
  const packageIdString = Array.isArray(packageId)
    ? (packageId[0] ?? "")
    : packageId;
  const router = useRouter();
  const { data: session } = useSession();

  const {
    data: packageData,
    isLoading: isPackageLoading,
    isError: isPackageError,
  } = api.quiz.getPackageWithSubtest.useQuery({ id: packageIdString });

  const {
    data: scoresSummary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
  } = api.quiz.getPackageScoresSummary.useQuery({ id: packageIdString });

  const sortedSubtests = packageData?.subtests
    ? sortSubtests(packageData.subtests)
    : [];

  const handleDownloadCertificate = async () => {
    if (!scoresSummary?.isPackageEndDatePassed) {
      toast.error("Sertifikat akan tersedia setelah tryout berakhir");
      return;
    }
    try {
      const response = await fetch(`/api/certificate/${packageId}`);
      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Gagal mengunduh sertifikat");
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Sertifikat_${session?.user?.name.replace(/\s+/g, "_")}_${packageData?.name.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Sertifikat berhasil diunduh");
    } catch (error) {
      toast.error("Gagal mengunduh sertifikat");
    }
  };

  if (isPackageError || isSummaryError) {
    return <ErrorPage />;
  }

  if (isPackageLoading || isSummaryLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen bg-white">
      <ScoreHeader
        packageName={scoresSummary.packageName}
        averageScore={scoresSummary.averageScore}
        userName={session?.user?.name || ""}
        totalCorrect={scoresSummary.totalCorrect}
        totalWrong={scoresSummary.totalWrong}
        totalKosong={scoresSummary.totalKosong}
        isPackageEndDatePassed={scoresSummary.isPackageEndDatePassed}
      />

      {/* Main Content */}
      <div className="mt-6 flex flex-col gap-6 md:flex-row">
        <UserScoreCard
          userName={session?.user?.name || ""}
          userImage={session?.user?.image || null}
          averageScore={scoresSummary.averageScore}
          isPackageEndDatePassed={scoresSummary.isPackageEndDatePassed}
          onViewPembahasan={() => router.push(`/tryout/${packageId}`)}
          onDownloadCertificate={handleDownloadCertificate}
          certificateDisabled={!scoresSummary.isPackageEndDatePassed}
        />

        {/* Right Panel - Detailed Scores */}
        <div className="w-full md:w-2/3">
          {/* Waiting Message */}
          {!scoresSummary.isPackageEndDatePassed && (
            <div className="mb-6 rounded-xl border border-[#acaeba] bg-gradient-to-t from-[#2d69db] to-[#223a67] p-6 text-white">
              <div className="flex items-center gap-2">
                <div>
                  <h3 className="font-bold text-white">
                    Skor dan pembahasan akan tersedia setelah tryout berakhir
                  </h3>
                  <p className="text-sm text-white">
                    Tanggal berakhir:{" "}
                    {scoresSummary.TOend
                      ? new Date(scoresSummary.TOend).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        )
                      : "Belum ditentukan"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <h2 className="text-center text-2xl font-bold text-black md:text-3xl">
            Bobot Penilaian
          </h2>

          <div className="space-y-2">
            {sortedSubtests.map((subtest) => {
              const subtestName = getSubtestDisplayName(subtest.type);
              const score = Math.min(
                subtest.quizSession?.[0]?.score || 0,
                1000,
              );
              const totalQuestions = subtest.quizSession?.[0]?.numQuestion || 0;
              const correctAnswers = subtest.quizSession?.[0]?.numCorrect || 0;
              const emptyAnswers =
                totalQuestions - (subtest.quizSession?.[0]?.numAnswered ?? 0);
              const wrongAnswers =
                totalQuestions - correctAnswers - emptyAnswers;
              const adjustedScore = Math.max(score - wrongAnswers, 0);
              const isCompleted =
                subtest.quizSession?.[0] &&
                new Date(subtest.quizSession[0].endTime ?? "") <= new Date();

              return (
                <SubtestScoreItem
                  key={subtest.id}
                  subtestShort={subtestName.short}
                  subtestFull={subtestName.full}
                  score={adjustedScore}
                  totalQuestions={totalQuestions}
                  correctAnswers={correctAnswers}
                  wrongAnswers={wrongAnswers}
                  emptyAnswers={emptyAnswers}
                  isCompleted={isCompleted}
                  isPackageEndDatePassed={scoresSummary.isPackageEndDatePassed}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
