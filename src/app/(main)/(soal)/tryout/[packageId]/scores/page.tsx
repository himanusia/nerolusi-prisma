"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "~/app/_components/ui/button";
import ErrorPage from "~/app/error";
import LoadingPage from "~/app/loading";
import { api } from "~/trpc/react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "~/app/_components/ui/avatar";

export default function ScoresPage() {
  const { packageId } = useParams();
  const router = useRouter();
  const { data: session } = useSession();

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

  // Calculate totals
  const totalQuestions = sortedSubtests?.reduce((sum, subtest) => sum + (subtest.totalQuestion || 0), 0) || 0;
  const totalCorrect = sortedSubtests?.reduce((sum, subtest) => sum + (subtest.totalCorrect || 0), 0) || 0;
  const totalWrong = sortedSubtests?.reduce((sum, subtest) => sum + ((subtest.totalQuestion || 0) - (subtest.totalCorrect || 0)), 0) || 0;
  const averageScore = sortedSubtests?.reduce((sum, subtest) => sum + (subtest.score || 0), 0) / (sortedSubtests?.length || 1) || 0;

  // Check if package end date has passed to show scores
  const isPackageEndDatePassed = packageData?.TOend && new Date(packageData.TOend) < new Date();
  const completedCount = sortedSubtests?.filter(s => s.quizSession && new Date(s.quizSession) <= new Date()).length || 0;
  const allSubtestsCompleted = completedCount === sortedSubtests?.length;

  const getSubtestName = (type: string) => {
    switch (type) {
      case "pu": return { short: "KPU", full: "Kemampuan Penalaran Umum" };
      case "ppu": return { short: "PPU", full: "Pengetahuan dan Pemahaman Umum" };
      case "pbm": return { short: "KMBM", full: "Kemampuan Memahami Bacaan dan Menulis" };
      case "pk": return { short: "PK", full: "Pengetahuan Kuantitatif" };
      case "lbi": return { short: "LBI", full: "Literasi dalam Bahasa Indonesia" };
      case "lbe": return { short: "LBE", full: "Literasi dalam Bahasa Inggris" };
      case "pm": return { short: "PM", full: "Penalaran Matematika" };
      default: return { short: String(type).toUpperCase(), full: String(type) };
    }
  };

  const getProgressColor = (correctAnswers: number, totalQuestions: number) => {
    const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    if (percentage >= 70) return { fill: "bg-[#278d46]", bg: "bg-[#82d6b9]" };
    if (percentage >= 60) return { fill: "bg-[#84b338]", bg: "bg-[#d8ff9a]" };
    if (percentage >= 50) return { fill: "bg-[#ceb13c]", bg: "bg-[#ffde59]" };
    return { fill: "bg-[#ffa898]", bg: "bg-[#ffd5d5]" };
  };

  return isError ? (
    <ErrorPage />
  ) : isLoading ? (
    <LoadingPage />
  ) : (
    <div className="min-h-screen">
      {/* Header - Green Card */}
      <div className="bg-gradient-to-t from-[#32b274] to-[#2b8057] text-white p-6 rounded-lg mx-6 mt-6 border-[#acaeba] border">
        <div className="flex items-center">
          {/* Left Side - Score Info (1/3) */}
          <div className="w-1/3 flex flex-col items-center ml-20 mt-5">
            <h1 className="text-3xl font-bold text-white mb-1 text-center">
              {packageData?.name || "Try Out UTBK"}
            </h1>
            {/* <h2 className="text-lg font-bold text-white mb-1">
              #1 2026
            </h2> */}
            <div className="text-6xl font-bold text-white mb-1">
              {isPackageEndDatePassed ? Math.round(averageScore) : "-"}
            </div>
            <p className="text-white text-md font-semibold mb-5">
              Nilai Rata-rata mu!
            </p>
          </div>
          
          {/* Vertical Separator */}
          <div className="w-px h-40 bg-white mx-10"></div>
          
          {/* Right Side - User Info and Summary (2/3) */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-right mb-6 text-center">
              <h2 className="text-2xl font-bold text-white text-center">
                {session?.user?.name}
              </h2>
              <p className="text-white text-xl font-semibold text-center">
                SMA Islam Cikal Harapan I BSD
              </p>
            </div>
            
            {/* Score Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#e9fff4] rounded-lg p-3 text-center min-w-[80px]">
                <div className="text-3xl font-bold text-[#1f773a]">
                  {isPackageEndDatePassed ? totalCorrect : "-"}
                </div>
                <p className="text-[#1f773a] text-lg font-semibold flex items-center justify-center gap-1">
                  <span className="text-[#1f773a] text-center">✓</span> Benar
                </p>
              </div>
              <div className="bg-[#ffebeb] rounded-lg p-3 text-center min-w-[80px]">
                <div className="text-3xl font-bold text-[#811515]">
                  {isPackageEndDatePassed ? totalWrong : "-"}
                </div>
                <p className="text-[#811515] text-lg font-semibold flex items-center justify-center gap-1">
                  <span className="text-[#811515] text-center">✗</span> Salah
                </p>
              </div>
              <div className="bg-[#f2f2f2] rounded-lg p-3 text-center min-w-[80px]">
                <div className="text-3xl font-bold text-[#545454]">
                  {isPackageEndDatePassed ? (totalQuestions - totalCorrect - totalWrong) : "-"}
                </div>
                <p className="text-[#545454] text-lg font-semibold flex items-center justify-center gap-1">
                  <span className="text-[#545454] text-center">?</span> Kosong
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-6 mx-6 mt-6">
        {/* Left Panel - User Info */}
        <div className="w-1/3 -mt-10">
            {/* Nerolusi Logo */}
            <div className="flex items-center justify-center -mt-5">
                <Image src="/logo2.png" alt="logo nerolusi" width={150} height={100} />
            </div>
          <div className="bg-[#f2f2f2] rounded-lg py-6 px-10 shadow-sm border -mt-10">
            {/* User Avatar */}
            <div className="text-center mb-4">
                <Avatar className="h-16 w-16 justify-center mx-auto mb-2">
                    <AvatarImage src={session.user.image || ""} />
                    <AvatarFallback>{session.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              <h3 className="text-2xl font-bold text-gray-800">
                {session?.user?.name}
              </h3>
              <p className="text-black font-bold text-md">
                SMA Islam Cikal Harapan I BSD
              </p>
            </div>
            
            {/* Score Display */}
            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-[#2b8057] mb-1">
                {isPackageEndDatePassed ? Math.round(averageScore) : "-"}
              </div>
              <p className="text-[#2b8057] text-lg font-bold">Skor rata-rata</p>
            </div>
            
            {/* Buttons */}
            <div className="space-y-3">
              <Button
                variant="default"
                className="w-full"
                onClick={() => router.push(`/tryout/${packageId}`)}
              >
                Pembahasan
              </Button>
              <Button 
                variant="default" 
                className="w-full rounded-lg"
                onClick={() => {
                  alert("Fitur unduh sertifikat akan segera tersedia!");
                }}
              >
                📄 Unduh Sertifikat
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panel - Detailed Scores */}
        <div className="w-2/3">
          {/* Success Message */}
          {isPackageEndDatePassed && (
            <div className="bg-gradient-to-t from-[#2d69db] to-[#223a67] text-white rounded-xl p-6 mb-6 border border-[#acaeba]">
              <div className="text-start">
                <h3 className="text-xl font-bold text-white mb-3">
                  Selamat, Anda dinyatakan lolos pilihan pertama anda!
                </h3>
                <div className="text-left space-y-1">
                  <div className="flex">
                    <span className="font-bold text-white w-32">PTN</span>
                    <span className="text-white">: Institut Teknologi Bandung</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold text-white w-32">Program Studi</span>
                    <span className="text-white">: Sekolah Teknik Elektro dan Informatika - Komputasi (STEI-K)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Waiting Message */}
          {!isPackageEndDatePassed && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">⏰</span>
                </div>
                <div>
                  <h3 className="font-bold text-blue-800">
                    Skor dan pembahasan akan tersedia setelah tryout berakhir
                  </h3>
                  <p className="text-blue-600 text-sm">
                    Tanggal berakhir: {packageData?.TOend ? new Date(packageData.TOend).toLocaleDateString('id-ID', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    }) : 'Belum ditentukan'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <h2 className="text-3xl font-bold text-black text-center">
            Bobot Penilaian
          </h2>
          
          <div className="space-y-2">
            {sortedSubtests?.map((subtest) => {
              const subtestName = getSubtestName(subtest.type);
              const score = subtest.score || 0;
              const totalQuestions = subtest.totalQuestion || 0;
              const correctAnswers = subtest.totalCorrect || 0;
              const wrongAnswers = totalQuestions - correctAnswers;
              const emptyAnswers = 0;
              const isCompleted = subtest.quizSession && new Date(subtest.quizSession) <= new Date();
              
              return (
                <div key={subtest.id} className="bg-white p-4 border-b-2 border-black last:border-b-0">
                  <div className="flex justify-between items-start">
                    {/* Left Side - Content */}
                    <div className="flex-1 mr-6">
                      {/* Top Row - Subtest name and score cards */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-2xl text-gray-800 mb-1">
                            {subtestName.short}
                          </h3>
                          <p className="text-gray-800 text-sm font-bold">
                            {subtestName.full}
                          </p>
                        </div>
                        
                        {/* Score Cards - Show when completed and end date passed */}
                        {isPackageEndDatePassed && isCompleted && (
                          <div className="flex items-center gap-3 ml-4">
                            <div className="bg-[#e9fff4] rounded-lg px-4 py-2 text-center min-w-[70px]">
                              <div className="text-[#1f773a] text-sm font-bold">Benar</div>
                              <div className="text-[#1f773a] text-xl font-bold">{correctAnswers}</div>
                            </div>
                            <div className="bg-[#ffebeb] rounded-lg px-4 py-2 text-center min-w-[70px]">
                              <div className="text-[#811515] text-sm font-bold">Salah</div>
                              <div className="text-[#811515] text-xl font-bold">{wrongAnswers}</div>
                            </div>
                            <div className="bg-[#f2f2f2] rounded-lg px-4 py-2 text-center min-w-[70px]">
                              <div className="text-[#545454] text-sm font-bold">Kosong</div>
                              <div className="text-[#545454] text-xl font-bold">{emptyAnswers}</div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Progress Bar */}
                      {isPackageEndDatePassed && isCompleted && (
                        <div className={`w-full rounded-full h-3 ${getProgressColor(correctAnswers, totalQuestions).bg}`}>
                          <div 
                            className={`h-3 rounded-full ${getProgressColor(correctAnswers, totalQuestions).fill}`}
                            style={{ width: `${totalQuestions > 0 ? Math.min((correctAnswers / totalQuestions) * 100, 100) : 0}%` }}
                          ></div>
                        </div>
                      )}
                      
                      {/* Status Messages */}
                      {!isPackageEndDatePassed && isCompleted && (
                        <div className="text-sm text-gray-500 italic mt-4">
                          Skor detail akan tersedia setelah tryout berakhir
                        </div>
                      )}
                      
                      {!isCompleted && (
                        <div className="text-sm text-gray-500 italic mt-4">
                          Subtest belum diselesaikan
                        </div>
                      )}
                    </div>
                    
                    {/* Right Side - Score Display */}
                    <div className="text-center bg-[#f2f2f2] rounded-lg px-4 py-2 min-w-[80px] self-start">
                      <div className="text-[#545454] text-lg font-bold mb-1">Skor</div>
                      <div className="text-4xl font-bold text-[#545454]">
                        {isPackageEndDatePassed && isCompleted ? Math.round(score) : (isCompleted ? "✓" : "--")}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
