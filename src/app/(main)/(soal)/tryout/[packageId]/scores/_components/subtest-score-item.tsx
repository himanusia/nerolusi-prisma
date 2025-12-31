"use client";

export function getProgressColor(
  correctAnswers: number,
  totalQuestions: number,
) {
  const percentage =
    totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  if (percentage >= 70) return { fill: "bg-[#278d46]", bg: "bg-[#82d6b9]" };
  if (percentage >= 60) return { fill: "bg-[#84b338]", bg: "bg-[#d8ff9a]" };
  if (percentage >= 50) return { fill: "bg-[#ceb13c]", bg: "bg-[#ffde59]" };
  return { fill: "bg-[#ffa898]", bg: "bg-[#ffd5d5]" };
}

interface SubtestScoreItemProps {
  subtestShort: string;
  subtestFull: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  emptyAnswers: number;
  isCompleted: boolean;
  isPackageEndDatePassed: boolean;
}

export function SubtestScoreItem({
  subtestShort,
  subtestFull,
  score,
  totalQuestions,
  correctAnswers,
  wrongAnswers,
  emptyAnswers,
  isCompleted,
  isPackageEndDatePassed,
}: SubtestScoreItemProps) {
  return (
    <div className="border-b-2 border-black bg-white py-4 last:border-b-0">
      <div className="flex items-start justify-between">
        {/* Left Side */}
        <div className="mr-1 flex-1 md:mr-3">
          {/* Subtest name and score cards */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-md mb-1 font-bold text-gray-800 md:text-2xl">
                {subtestShort}
              </h3>
              <p className="hidden text-sm font-bold text-gray-800 md:block">
                {subtestFull}
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
          <div className="text-lg font-bold text-[#545454]">Skor</div>
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
}
