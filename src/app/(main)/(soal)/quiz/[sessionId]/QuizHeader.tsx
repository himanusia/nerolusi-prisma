import { Card, CardContent } from "~/app/_components/ui/card";
import { Clock } from "lucide-react";

interface QuizHeaderProps {
  subtestType: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  timeLeft: number;
  endTime: Date | string;
  answeredCount: number;
}

export function QuizHeader({
  subtestType,
  currentQuestionIndex,
  totalQuestions,
  timeLeft,
  endTime,
  answeredCount,
}: QuizHeaderProps) {
  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const getSubtestTitle = (type: string) => {
    const titles: Record<string, string> = {
      pu: "Kemampuan Penalaran Umum",
      ppu: "Pengetahuan dan Pemahaman Umum",
      pbm: "Kemampuan Memahami Bacaan dan Menulis",
      pk: "Pengetahuan Kuantitatif",
      pm: "Penalaran Matematika",
      lbe: "Literasi Bahasa Inggris",
      lbi: "Literasi Bahasa Indonesia",
      matematika_wajib: "Matematika Wajib",
      bahasa_indonesia: "Bahasa Indonesia",
      bahasa_inggris: "Bahasa Inggris",
      matematika_lanjut: "Matematika Lanjut",
      fisika: "Fisika",
      kimia: "Kimia",
      biologi: "Biologi",
      ekonomi: "Ekonomi",
      geografi: "Geografi",
      sejarah: "Sejarah",
      ppkn: "PPKn",
      projek_kreatif_kewirausahaan: "Projek Kreatif Kewirausahaan",
    };
    return titles[type] || "";
  };

  return (
    <Card className="border-[#2b8057] bg-gradient-to-r from-green-50 to-white">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-bold text-[#2b8057]">
              {getSubtestTitle(subtestType)}
            </h1>
            <p className="text-gray-600">
              Soal {currentQuestionIndex + 1} dari {totalQuestions}
            </p>
          </div>

          {/* Timer */}
          {timeLeft > 0 && new Date(endTime) > new Date() && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2">
                <Clock className="h-5 w-5 text-[#2b8057]" />
                <span className="font-mono text-lg font-bold text-[#2b8057]">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Simple Progress Bar */}
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-600">Progress</span>
            <span className="text-sm font-medium text-[#2b8057]">
              {answeredCount}/{totalQuestions} dijawab
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-[#2b8057] transition-all duration-300"
              style={{
                width: `${(answeredCount / (totalQuestions || 1)) * 100}%`,
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
