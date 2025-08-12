"use client";

import { Button } from "~/app/_components/ui/button";
import { Card, CardContent } from "~/app/_components/ui/card";
import { Badge } from "~/app/_components/ui/badge";
import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { SubtestType } from "@prisma/client";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import ErrorPage from "~/app/error";
import LoadingPage from "~/app/loading";
import { Clock, Users, FileText } from "lucide-react";

export default function DrillVideoPage() {
  const { drill, subtest } = useParams(); // drill = subject, subtest = videoId
  const router = useRouter();
  const session = useSession();

  // Map subject titles to SubtestType enum values for database query
  const getSubtestTypeFromTitle = (title: string): SubtestType | null => {
    const decodedTitle = decodeURIComponent(title);
    switch (decodedTitle) {
      case "Matematika Wajib":
      case "Matematika Lanjut":
        return "pk";
      case "Bahasa Indonesia":
        return "lbi";
      case "Bahasa Inggris":
        return "lbe";
      case "Fisika":
      case "Kimia":
      case "Biologi":
        return "pm";
      case "Ekonomi":
      case "Sosiologi":
      case "Geografi":
      case "Sejarah":
      case "PPKN":
      case "Projek Kreatif & Kewirausahaan":
        return "ppu";
      default:
        return null;
    }
  };

  // Get dummy video info based on videoId 
  const getVideoInfo = (videoId: string) => {
    const id = parseInt(videoId);
    // This would ideally come from database, but using dummy data for now
    const videoTitles: { [key: number]: string } = {
      1: "Teori Bilangan",
      2: "Operasi Bilangan", 
      3: "Aritmatika Sosial",
      4: "Konsep Aljabar",
      5: "Sistem Persamaan Linear",
      6: "Program Linear",
      7: "Konsep Himpunan",
      8: "Operasi Himpunan",
      9: "Fungsi Linear",
      10: "Fungsi Kuadrat",
      11: "Pengertian Persamaan Kuadrat",
      12: "Menyelesaikan Persamaan Kuadrat",
      13: "Diskriminan",
      14: "Fungsi Kuadrat",
      15: "Grafik Fungsi Kuadrat", 
      16: "Aplikasi Fungsi Kuadrat",
    };
    
    return {
      id,
      title: videoTitles[id] || `Video ${id}`,
      subject: decodeURIComponent(drill as string)
    };
  };

  const videoInfo = getVideoInfo(subtest as string);
  const subtestType = getSubtestTypeFromTitle(drill as string);

  const {
    data: packages,
    isLoading,
    isError,
  } = api.quiz.getDrillSubtest.useQuery(
    { subtest: subtestType! },
    { enabled: !!subtestType }
  );

  const startSessionMutation = api.quiz.createSession.useMutation();
  const getSessionMutation = api.quiz.getSession.useMutation();

  async function handleSubtestClick(
    subtestId: string,
    duration: number,
    packageId: string,
  ) {
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
          packageId,
          subtestId,
          duration: duration ?? 10000,
        });
      }

      router.push(`/${drill}/${subtest}/${packageId}/${quizSession.id}`);
    } catch (error) {
      console.error(error);
      toast.error("Error creating session", {
        description: error.message,
      });
    }
  }

  return isError || !subtestType ? (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          {!subtestType ? "Subject tidak ditemukan untuk drill" : "Error memuat data drill"}
        </p>
        <Button 
          onClick={() => router.back()} 
          className="mt-4 bg-[#2b8057] hover:bg-[#1f5a40]"
        >
          Kembali
        </Button>
      </div>
    </div>
  ) : isLoading ? (
    <LoadingPage />
  ) : (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#2b8057] mb-2">
          Drill {videoInfo.subject} - {videoInfo.title}
        </h1>
        <p className="text-gray-600">Pilih paket drill untuk video ini</p>
      </div>

      {/* Drill Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`relative bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
              pkg.hasQuizSession 
                ? "border-[#2b8057] bg-green-50" 
                : "border-gray-200 hover:border-[#2b8057]"
            }`}
            onClick={() => handleSubtestClick(pkg.id, pkg.duration, pkg.package.id)}
          >
            {/* Package Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {pkg.package.name}
            </h3>

            {/* Package Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Jumlah Soal:</span>
                <span className="font-medium">{pkg._count.questions} soal</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Durasi:</span>
                <span className="font-medium">{pkg.duration} menit</span>
              </div>
            </div>

            {/* Score Display (if attempted) */}
            {pkg.hasQuizSession && (
              <div className="bg-[#2b8057] text-white rounded-lg p-3 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold">
                    {pkg._count.correct}/{pkg._count.questions}
                  </div>
                  <div className="text-sm opacity-90">Jawaban Benar</div>
                </div>
              </div>
            )}

            {/* Action Button */}
            <Button
              className={`w-full ${
                pkg.hasQuizSession
                  ? "bg-[#2b8057] hover:bg-[#1f5a40] text-white"
                  : "bg-[#2b8057] hover:bg-[#1f5a40] text-white"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleSubtestClick(pkg.id, pkg.duration, pkg.package.id);
              }}
            >
              {pkg.hasQuizSession ? "Ulangi Drill" : "Mulai Drill"}
            </Button>

            {/* Status Badge */}
            {pkg.hasQuizSession && (
              <div className="absolute top-4 right-4">
                <div className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                  Selesai
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {packages.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Belum ada paket drill tersedia</p>
        </div>
      )}
    </div>
  );
}
