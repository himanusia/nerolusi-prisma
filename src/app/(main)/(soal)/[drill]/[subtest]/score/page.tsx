"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "~/app/_components/ui/button";
import { Card, CardContent } from "~/app/_components/ui/card";

export default function DrillVideoScorePage() {
  const { drill, subtest } = useParams(); // drill = subject, subtest = videoId
  const router = useRouter();

  // Get dummy video info based on videoId 
  const getVideoInfo = (videoId: string) => {
    const id = parseInt(videoId);
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

  // Mock score data - in real app this would come from API
  const mockScoreData = {
    totalQuestions: 10,
    correctAnswers: 7,
    wrongAnswers: 3,
    score: 70,
    completedAt: new Date().toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#2b8057] mb-2">
          Hasil Drill: {videoInfo.subject}
        </h1>
        <h2 className="text-xl text-gray-700 mb-4">
          {videoInfo.title}
        </h2>
        <p className="text-gray-600">Berikut adalah hasil drill soal yang telah Anda kerjakan</p>
      </div>

      {/* Score Card */}
      <Card className="border-[#2b8057]">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className={`text-6xl font-bold mb-2 ${
              mockScoreData.score >= 80 ? 'text-green-500' : 
              mockScoreData.score >= 60 ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {mockScoreData.score}%
            </div>
            <p className="text-gray-600">Skor Anda</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#2b8057] mb-1">
                {mockScoreData.totalQuestions}
              </div>
              <p className="text-sm text-gray-600">Total Soal</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500 mb-1">
                {mockScoreData.correctAnswers}
              </div>
              <p className="text-sm text-gray-600">Jawaban Benar</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500 mb-1">
                {mockScoreData.wrongAnswers}
              </div>
              <p className="text-sm text-gray-600">Jawaban Salah</p>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500">
            Diselesaikan pada: {mockScoreData.completedAt}
          </div>
        </CardContent>
      </Card>

      {/* Performance Analysis */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Analisis Performa
          </h3>
          
          <div className="space-y-3">
            {mockScoreData.score >= 80 && (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <div className="text-green-500 text-xl">🎉</div>
                <div>
                  <p className="font-medium text-green-800">Excellent!</p>
                  <p className="text-sm text-green-600">
                    Anda telah menguasai materi {videoInfo.title} dengan sangat baik!
                  </p>
                </div>
              </div>
            )}
            
            {mockScoreData.score >= 60 && mockScoreData.score < 80 && (
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <div className="text-yellow-500 text-xl">👍</div>
                <div>
                  <p className="font-medium text-yellow-800">Good Job!</p>
                  <p className="text-sm text-yellow-600">
                    Pemahaman Anda cukup baik, terus tingkatkan lagi!
                  </p>
                </div>
              </div>
            )}
            
            {mockScoreData.score < 60 && (
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <div className="text-red-500 text-xl">💪</div>
                <div>
                  <p className="font-medium text-red-800">Keep Trying!</p>
                  <p className="text-sm text-red-600">
                    Jangan menyerah! Ulangi video dan coba drill lagi.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={() => router.push(`/${drill}/${subtest}`)}
          className="bg-[#2b8057] hover:bg-[#1f5a40] text-white"
        >
          🔄 Ulangi Drill
        </Button>
        
        <Button
          onClick={() => router.push(`/video/materi/${drill}`)}
          variant="outline"
          className="border-[#2b8057] text-[#2b8057] hover:bg-[#2b8057] hover:text-white"
        >
          📚 Kembali ke Materi
        </Button>
        
        <Button
          onClick={() => router.push(`/video/materi/${drill}/${subtest}`)}
          variant="outline"
          className="border-gray-300 text-gray-600 hover:bg-gray-50"
        >
          📺 Tonton Ulang Video
        </Button>
      </div>
    </div>
  );
}
