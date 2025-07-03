"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "~/app/_components/ui/button";
import ErrorPage from "~/app/error";
import LoadingPage from "~/app/loading";
import { api } from "~/trpc/react";

export default function QuizPage() {
  const { packageId } = useParams();
  const startSessionMutation = api.quiz.createSession.useMutation();
  const getSessionMutation = api.quiz.getSession.useMutation();
  const router = useRouter();
  const session = useSession();

  const {
    data: packageData,
    isLoading,
    isError,
  } = api.quiz.getPackageWithSubtest.useQuery({ id: Number(packageId) });

  const subtestOrder = ["pu", "ppu", "pbm", "pk", "lbi", "lbe", "pm"];
  
  const sortedSubtests = packageData?.subtests?.sort((a, b) => {
    const indexA = subtestOrder.indexOf(a.type);
    const indexB = subtestOrder.indexOf(b.type);
    return indexA - indexB;
  });

  // Check if all subtests are completed
  const completedCount = sortedSubtests?.filter(s => s.quizSession && new Date(s.quizSession) <= new Date()).length || 0;
  const allSubtestsCompleted = completedCount === sortedSubtests?.length;
  const isPackageEndDatePassed = new Date(packageData?.TOend || new Date()) < new Date();

  // If all subtests are completed but end date hasn't passed, redirect to scores page
  React.useEffect(() => {
    if (packageData && allSubtestsCompleted && sortedSubtests?.length > 0 && !isPackageEndDatePassed) {
      toast.info("Semua subtest telah diselesaikan. Pembahasan akan tersedia setelah tryout berakhir.");
      router.push(`/tryout/${packageId}/scores`);
    }
  }, [packageData, allSubtestsCompleted, sortedSubtests, isPackageEndDatePassed, router, packageId]);

  return isError ? (
    <ErrorPage />
  ) : isLoading ? (
    <LoadingPage />
  ) : (
    <div className="flex min-h-screen bg-white">
      {/* Left Panel */}
      <div className="w-1/3 px-10 py-5 border-[1px] border-[#acaeba]">
        {/* Back Button */}
        <Button 
          variant="outline" 
          onClick={() => router.push('/tryout')}
          className="mb-5"
        >
          ← Kembali
        </Button>

        {/* Title */}
        <div className="mb-4 flex flex-col justify-center items-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            {packageData.name}
          </h1>
          
          {/* Date Range */}
          <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg w-fit">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-bold">
              {new Date(packageData.TOstart).toLocaleDateString('id-ID', { 
                day: 'numeric', 
                month: 'long' 
              })} - {new Date(packageData.TOend).toLocaleDateString('id-ID', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric'
              })}
            </span>
          </div>
        </div>

        {/* Progress Circle */}
        <div className="flex items-center justify-center mb-4">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
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
                strokeDasharray={`${(sortedSubtests?.filter(s => s.quizSession && new Date(s.quizSession) <= new Date()).length / sortedSubtests?.length) * 251.2} 251.2`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-800">
                {sortedSubtests?.filter(s => s.quizSession && new Date(s.quizSession) <= new Date()).length || 0}/{sortedSubtests?.length || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Subtest List */}
        <div className="space-y-2">
          {sortedSubtests?.map((subtest, index) => {
            const isSubmitted = subtest.quizSession && new Date(subtest.quizSession) <= new Date();
            const completedCount = sortedSubtests?.filter(s => s.quizSession && new Date(s.quizSession) <= new Date()).length || 0;
            const isCurrentSubtest = index === completedCount && !isSubmitted; // Next in sequence
            const isPackageEndDatePassed = new Date(packageData.TOend) < new Date();
            const allSubtestsCompleted = completedCount === sortedSubtests?.length;
            
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
                className={`w-full h-12 justify-center items-center rounded-lg transition-all ${
                  isSubmitted || isCurrentSubtest ? "cursor-pointer" : "pointer-events-none"
                }`}
                onClick={() => {
                  if (isSubmitted) {
                    // Navigate to view results
                    handleViewResults(subtest.id);
                  } else if (isCurrentSubtest) {
                    // Start new session
                    handleSubtestClick(subtest.id, subtest.duration);
                  }
                }}
              >
                <div className="w-full text-center">
                  <div className="font-bold text-md">
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
                          return subtest.type;
                      }
                    })()}
                  </div>
                  {isSubmitted && subtest.score && (
                    <div className="text-sm opacity-90">
                      Score: {subtest.score} | {subtest.totalCorrect}/{subtest.totalQuestion}
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
      <div className="w-2/3 bg-[#2b8057]/30 flex items-center justify-center p-8">
        <div className="bg-white rounded-sm p-5 max-w-md w-full text-center border-[1px] border-[#acaeba]">

          {(() => {
            const completedCount = sortedSubtests?.filter(s => s.quizSession && new Date(s.quizSession) <= new Date()).length || 0;
            const currentSubtest = sortedSubtests?.[completedCount]; // Next in sequence
            
            if (currentSubtest) {
              const subtestName = (() => {
                switch (currentSubtest.type) {
                  case "pu": return { short: "PU", full: "Kemampuan Penalaran Umum" };
                  case "ppu": return { short: "PPU", full: "Pengetahuan dan Pemahaman Umum" };
                  case "pbm": return { short: "PBM", full: "Kemampuan Memahami Bacaan dan Menulis" };
                  case "pk": return { short: "PK", full: "Pengetahuan Kuantitatif" };
                  case "lbi": return { short: "LBI", full: "Literasi dalam Bahasa Indonesia" };
                  case "lbe": return { short: "LBE", full: "Literasi dalam Bahasa Inggris" };
                  case "pm": return { short: "PM", full: "Penalaran Matematika" };
                  default: return { short: String(currentSubtest.type).toUpperCase(), full: String(currentSubtest.type) };
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
                  <p className="text-gray-600 mb-2">
                    {subtestName.full}
                  </p>
                  
                  <div className="flex flex-col items-center justify-center gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold">20 Soal</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold">{currentSubtest.duration} Menit</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="default"
                    className="text-md font-normal"
                    onClick={() => handleSubtestClick(currentSubtest.id, currentSubtest.duration)}
                  >
                    Start!
                  </Button>
                </>
              );
            } else {
              // All subtests completed
              const isPackageEndDatePassed = new Date(packageData.TOend) < new Date();
              
              return (
                <>
                  <h3 className="text-xl font-bold text-green-700 mb-2">
                    Selesai! 🎉
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Semua subtest telah diselesaikan
                  </p>
                  
                  {isPackageEndDatePassed ? (
                    <Button 
                      variant="default"
                      className="text-md font-normal bg-[#2b8057] hover:bg-[#2b8057]/80 mb-4"
                      onClick={() => router.push(`/tryout/${packageId}/scores`)}
                    >
                      Lihat Hasil
                    </Button>
                  ) : (
                    <Button 
                      variant="default"
                      className="text-md font-normal bg-[#2b8057] hover:bg-[#2b8057]/80 mb-4"
                      onClick={() => router.push(`/tryout/${packageId}/scores`)}
                    >
                      Lihat Status
                    </Button>
                  )}
                  
                  {!isPackageEndDatePassed && (
                    <div className="text-sm text-gray-500 mt-2">
                      <p>Skor detail akan tersedia setelah:</p>
                      <p className="font-semibold">
                        {new Date(packageData.TOend).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  )}
                </>
              );
            }
          })()}
        </div>
      </div>
    </div>
  );

  async function handleSubtestClick(subtestId: number, duration: number) {
    if (!session.data || !session.data.user) {
      toast.error("Anda harus login terlebih dahulu");
      return;
    }

    const userId = session.data.user.id;
    const packageIdInt = Number(packageId);

    try {
      let quizSession;

      quizSession = await getSessionMutation.mutateAsync({
        userId,
        subtestId,
      });

      if (!quizSession) {
        quizSession = await startSessionMutation.mutateAsync({
          userId,
          packageId: packageIdInt,
          subtestId,
          duration: duration ?? 10000,
        });
      }

      router.push(`/tryout/${packageId}/${quizSession.id}`);
    } catch (error) {
      console.error(error);
      toast.error("Error creating session", {
        description: error.message,
      });
    }
  }

  async function handleViewResults(subtestId: number) {
    if (!session.data || !session.data.user) {
      toast.error("Anda harus login terlebih dahulu");
      return;
    }

    const userId = session.data.user.id;
    const isPackageEndDatePassed = new Date(packageData.TOend) < new Date();

    if (isPackageEndDatePassed) {
      try {
        const quizSession = await getSessionMutation.mutateAsync({
          userId,
          subtestId,
        });

        if (quizSession) {
          // Navigate to the session page to view results
          router.push(`/tryout/${packageId}/${quizSession.id}`);
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
