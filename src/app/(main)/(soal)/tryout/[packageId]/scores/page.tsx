"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "~/app/_components/ui/button";
import ErrorPage from "~/app/error";
import LoadingPage from "~/app/loading";
import { api } from "~/trpc/react";
import Image from "next/image";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/app/_components/ui/avatar";

export default function ScoresPage() {
  const { packageId } = useParams();
  const packageIdString = Array.isArray(packageId)
    ? (packageId[0] ?? "")
    : packageId;
  const router = useRouter();
  const { data: session } = useSession();

  const {
    data: packageData,
    isLoading,
    isError,
  } = api.quiz.getPackageWithSubtest.useQuery({ id: packageIdString });

  const subtestOrder = ["pu", "ppu", "pbm", "pk", "lbi", "lbe", "pm"];

  const sortedSubtests = packageData?.subtests?.sort((a, b) => {
    const indexA = subtestOrder.indexOf(a.type);
    const indexB = subtestOrder.indexOf(b.type);
    return indexA - indexB;
  });

  // Calculate totals
  const totalQuestions =
    sortedSubtests?.reduce(
      (sum, subtest) => sum + (subtest.quizSession?.[0]?.numQuestion ?? 0),
      0,
    ) || 0;
  const totalCorrect =
    sortedSubtests?.reduce(
      (sum, subtest) => sum + (subtest.quizSession?.[0]?.numCorrect ?? 0),
      0,
    ) || 0;
  const averageScore =
    sortedSubtests?.reduce(
      (sum, subtest) => sum + (subtest.quizSession?.[0]?.score ?? 0),
      0,
    ) / (sortedSubtests?.length || 1) || 0;

  const totalKosong =
    totalQuestions -
    sortedSubtests?.reduce(
      (sum, subtest) => sum + (subtest.quizSession?.[0]?.numAnswered ?? 0),
      0,
    );

  const totalWrong = totalQuestions - totalCorrect - totalKosong;

  // Check if package end date has passed to show scores
  const isPackageEndDatePassed =
    packageData?.TOend && new Date(packageData.TOend) < new Date();
  const completedCount =
    sortedSubtests?.filter(
      (s) =>
        s.quizSession?.[0] &&
        new Date(s.quizSession[0].endTime ?? "") <= new Date(),
    ).length || 0;
  const allSubtestsCompleted = completedCount === sortedSubtests?.length;
  
  const isTka = session?.user?.enrolledTka ?? false;

  const getSubtestName = (type: string) => {
    switch (type) {
      case "pu":
        return { short: "KPU", full: "Kemampuan Penalaran Umum" };
      case "ppu":
        return { short: "PPU", full: "Pengetahuan dan Pemahaman Umum" };
      case "pbm":
        return { short: "KMBM", full: "Kemampuan Memahami Bacaan dan Menulis" };
      case "pk":
        return { short: "PK", full: "Pengetahuan Kuantitatif" };
      case "lbi":
        return { short: "LBI", full: "Literasi dalam Bahasa Indonesia" };
      case "lbe":
        return { short: "LBE", full: "Literasi dalam Bahasa Inggris" };
      case "pm":
        return { short: "PM", full: "Penalaran Matematika" };
      default:
        return { short: String(type).toUpperCase(), full: String(type) };
    }
  };

  const getProgressColor = (correctAnswers: number, totalQuestions: number) => {
    const percentage =
      totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
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
    <div className="min-h-screen bg-white">
      {/* Header*/}
      <div className="mt-4 rounded-lg border border-[#acaeba] bg-gradient-to-t from-[#32b274] to-[#2b8057] p-4 text-white md:mt-6 md:p-6">
        <div className="md:spacey-0 flex flex-col space-y-4 md:flex-row md:items-center">
          {/* Left Side */}
          <div className="flex flex-1 flex-col items-center md:ml-20 md:mt-5 md:w-1/3">
            <h1
              className={`mb-3 text-center font-bold text-white md:mb-1 md:text-3xl ${packageData?.name && packageData.name.length > 20 ? "text-2xl" : packageData?.name && packageData.name.length > 15 ? "text-3xl" : "text-4xl"}`}
            >
              {packageData?.name}
            </h1>
            <div className="mb-1 text-6xl font-bold text-white">
              {isPackageEndDatePassed ? Math.round(averageScore) : "-"}
            </div>
            <p className="text-md mb-5 hidden font-semibold text-white md:block">
              Nilai Rata-rata mu!
            </p>
          </div>

          {/* Vertical Separator */}
          <div className="mx-10 hidden h-40 w-px bg-white md:block"></div>

          {/* Right Side - User Info and Summary (2/3) */}
          <div className="flex flex-1 flex-col items-center justify-center border-t border-white py-4 md:border-t-0">
            <div className="mb-6 text-center">
              <h2 className="text-center text-xl font-bold text-white md:text-2xl">
                {session?.user?.name}
              </h2>
              <p className="text-md text-center font-semibold text-white md:text-xl">
                SMA Islam Cikal Harapan I BSD
              </p>
            </div>

            {/* Score Summary Cards */}
            <div className="grid w-full max-w-md grid-cols-3 gap-2 md:gap-3">
              <div className="min-w-[70px] rounded-md bg-[#e9fff4] p-2 text-center md:min-w-[80px] md:p-3">
                <div className="text-xl font-bold text-[#1f773a] md:text-3xl">
                  {isPackageEndDatePassed ? totalCorrect : "-"}
                </div>
                <p className="flex items-center justify-center gap-1 text-xs font-semibold text-[#1f773a] md:text-lg">
                  <span className="text-center text-[#1f773a]">✓</span> Benar
                </p>
              </div>
              <div className="min-w-[70px] rounded-md bg-[#ffebeb] p-2 text-center md:min-w-[80px] md:p-3">
                <div className="text-xl font-bold text-[#811515] md:text-3xl">
                  {isPackageEndDatePassed ? totalWrong : "-"}
                </div>
                <p className="flex items-center justify-center gap-1 text-xs font-semibold text-[#811515] md:text-lg">
                  <span className="text-center text-[#811515]">✗</span> Salah
                </p>
              </div>
              <div className="min-w-[70px] rounded-md bg-[#f2f2f2] p-2 text-center md:min-w-[80px] md:p-3">
                <div className="text-xl font-bold text-[#545454] md:text-3xl">
                  {isPackageEndDatePassed ? totalKosong : "-"}
                </div>
                <p className="flex items-center justify-center gap-1 text-xs font-semibold text-[#545454] md:text-lg">
                  <span className="text-center text-[#545454]">?</span> Kosong
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-6 flex flex-col gap-6 md:flex-row">
        {/* Left Panel - User Info */}
        <div className="-mt-10 w-full md:w-1/3">
          <div className="-mt-5 flex items-center justify-center">
            <Image
              src="/logo2.png"
              alt="logo nerolusi"
              width={150}
              height={100}
            />
          </div>
          <div className="-mt-10 rounded-lg border bg-[#f2f2f2] px-10 py-6 shadow-sm">
            <div className="mb-4 text-center">
              <Avatar className="mx-auto mb-2 h-16 w-16 justify-center">
                <AvatarImage src={session.user.image || ""} />
                <AvatarFallback>{session.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h3 className="text-2xl font-bold text-gray-800">
                {session?.user?.name}
              </h3>
              <p className="text-md font-bold text-black">
                {/* TODO: change to get from user data */}
                {/* {session?.user?.school ? session.user.school : "-"} */}
                -
              </p>
            </div>

            {/* Score Display */}
            <div className="mb-6 text-center">
              <div className="mb-1 text-5xl font-bold text-[#2b8057]">
                {isPackageEndDatePassed ? Math.round(averageScore) : "-"}
              </div>
              <p className="text-lg font-bold text-[#2b8057]">Skor rata-rata</p>
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
        <div className="w-full md:w-2/3">
          {/* Success Message */}
          {!isTka && isPackageEndDatePassed && (
            <div className="mb-6 rounded-xl border border-[#acaeba] bg-gradient-to-t from-[#2d69db] to-[#223a67] p-6 text-white">
              <div className="text-start">
                <h3 className="text-md mb-3 text-xl font-bold text-white md:text-xl">
                  Selamat, Anda dinyatakan lolos pilihan pertama anda!
                </h3>
                <div className="space-y-1 text-left">
                  <div className="flex items-start">
                    <span className="w-28 flex-shrink-0 text-sm font-bold text-white md:w-32 md:text-lg">
                      PTN
                    </span>
                    <span className="mr-2 flex-shrink-0 text-sm text-white md:text-lg">
                      :
                    </span>
                    <span className="text-sm text-white md:text-lg">
                      Institut Teknologi Bandung
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-28 flex-shrink-0 text-sm font-bold text-white md:w-32 md:text-lg">
                      Program Studi
                    </span>
                    <span className="mr-2 flex-shrink-0 text-sm text-white md:text-lg">
                      :
                    </span>
                    <span className="text-sm text-white md:text-lg">
                      Sekolah Teknik Elektro dan Informatika - Komputasi
                      (STEI-K)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Waiting Message */}
          {!isPackageEndDatePassed && (
            <div className="mb-6 rounded-xl border border-[#acaeba] bg-gradient-to-t from-[#2d69db] to-[#223a67] p-6 text-white">
              <div className="flex items-center gap-2">
                {/* <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">⏰</span>
                </div> */}
                <div>
                  <h3 className="font-bold text-white">
                    Skor dan pembahasan akan tersedia setelah tryout berakhir
                  </h3>
                  <p className="text-sm text-white">
                    Tanggal berakhir:{" "}
                    {packageData?.TOend
                      ? new Date(packageData.TOend).toLocaleDateString(
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
            {sortedSubtests?.map((subtest) => {
              const subtestName = getSubtestName(subtest.type);
              const score = subtest.quizSession?.[0]?.score || 0;
              const totalQuestions = subtest.quizSession?.[0]?.numQuestion || 0;
              const correctAnswers = subtest.quizSession?.[0]?.numCorrect || 0;
              const emptyAnswers =
                totalQuestions - (subtest.quizSession?.[0]?.numAnswered ?? 0);
              const wrongAnswers =
                totalQuestions - correctAnswers - emptyAnswers;
              const isCompleted =
                subtest.quizSession?.[0] &&
                new Date(subtest.quizSession[0].endTime ?? "") <= new Date();

              return (
                <div
                  key={subtest.id}
                  className="border-b-2 border-black bg-white py-4 last:border-b-0"
                >
                  <div className="flex items-start justify-between">
                    {/* Left Side */}
                    <div className="mr-1 flex-1 md:mr-3">
                      {/* Subtest name and score cards */}
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex-1">
                          <h3
                            className={`text-md mb-1 font-bold text-gray-800 md:text-2xl`}
                          >
                            {subtestName.short}
                          </h3>
                          <p className="hidden text-sm font-bold text-gray-800 md:block">
                            {subtestName.full}
                          </p>
                        </div>

                        {/* Score Cards */}
                        {isPackageEndDatePassed && isCompleted && (
                          <div className="ml-2 flex items-center justify-center gap-1 md:gap-3">
                            <div className="min-w-[60px] max-w-[60px] rounded-lg bg-[#e9fff4] px-2 py-2 text-center md:min-w-[70px] md:max-w-[70px]">
                              <div className="text-xs font-bold text-[#1f773a] md:text-sm">
                                Benar
                              </div>
                              <div className="text-lg font-bold text-[#1f773a] md:text-xl">
                                {correctAnswers}
                              </div>
                            </div>
                            <div className="min-w-[60px] max-w-[60px] rounded-lg bg-[#ffebeb] px-2 py-2 text-center md:min-w-[70px] md:max-w-[70px]">
                              <div className="text-xs font-bold text-[#811515] md:text-sm">
                                Salah
                              </div>
                              <div className="text-lg font-bold text-[#811515] md:text-xl">
                                {wrongAnswers}
                              </div>
                            </div>
                            <div className="min-w-[60px] max-w-[65px] rounded-lg bg-[#f2f2f2] px-2 py-2 text-center md:min-w-[70px] md:max-w-[70px]">
                              <div className="text-xs font-bold text-[#545454] md:text-sm">
                                Kosong
                              </div>
                              <div className="text-lg font-bold text-[#545454] md:text-xl">
                                {emptyAnswers}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {isPackageEndDatePassed && isCompleted && (
                        <div
                          className={`h-3 w-full rounded-full ${getProgressColor(correctAnswers, totalQuestions).bg}`}
                        >
                          <div
                            className={`h-3 rounded-full ${getProgressColor(correctAnswers, totalQuestions).fill}`}
                            style={{
                              width: `${totalQuestions > 0 ? Math.min((correctAnswers / totalQuestions) * 100, 100) : 0}%`,
                            }}
                          ></div>
                        </div>
                      )}

                      {/* Status Messages */}
                      {!isPackageEndDatePassed && isCompleted && (
                        <div className="mt-4 text-sm italic text-gray-500">
                          Skor detail akan tersedia setelah tryout berakhir
                        </div>
                      )}

                      {!isCompleted && (
                        <div className="mt-4 text-sm italic text-gray-500">
                          Subtest belum diselesaikan
                        </div>
                      )}
                    </div>

                    {/* Right Side - Score Display */}
                    <div className="flex h-[88px] min-w-[75px] max-w-[80px] flex-col items-center justify-center self-start rounded-lg bg-[#f2f2f2] px-3 py-2 text-center md:h-[92px] md:min-w-[80px] md:max-w-[80px]">
                      <div className="text-lg font-bold text-[#545454]">
                        Skor
                      </div>
                      <div className="text-3xl font-bold text-[#545454] md:text-4xl">
                        {isPackageEndDatePassed && isCompleted
                          ? Math.round(score)
                          : isCompleted
                            ? "✓"
                            : "--"}
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
