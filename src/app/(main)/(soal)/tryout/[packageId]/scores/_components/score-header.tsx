"use client";

interface ScoreHeaderProps {
  packageName: string;
  averageScore: number;
  userName: string;
  totalCorrect: number;
  totalWrong: number;
  totalKosong: number;
  isPackageEndDatePassed: boolean;
}

export function ScoreHeader({
  packageName,
  averageScore,
  userName,
  totalCorrect,
  totalWrong,
  totalKosong,
  isPackageEndDatePassed,
}: ScoreHeaderProps) {
  return (
    <div className="mt-4 rounded-lg border border-[#acaeba] bg-gradient-to-t from-[#32b274] to-[#2b8057] p-4 text-white md:mt-6 md:p-6">
      <div className="md:spacey-0 flex flex-col space-y-4 md:flex-row md:items-center">
        {/* Left Side */}
        <div className="flex flex-1 flex-col items-center md:ml-20 md:mt-5 md:w-1/3">
          <h1
            className={`mb-3 text-center font-bold text-white md:mb-1 md:text-3xl ${
              packageName && packageName.length > 20
                ? "text-2xl"
                : packageName && packageName.length > 15
                  ? "text-3xl"
                  : "text-4xl"
            }`}
          >
            {packageName}
          </h1>
          <div className="mb-1 text-6xl font-bold text-white">
            {isPackageEndDatePassed ? averageScore : "-"}
          </div>
          <p className="text-md mb-5 hidden font-semibold text-white md:block">
            Nilai Rata-rata mu!
          </p>
        </div>

        {/* Vertical Separator */}
        <div className="mx-10 hidden h-40 w-px bg-white md:block"></div>

        {/* Right Side - User Info and Summary */}
        <div className="flex flex-1 flex-col items-center justify-center border-t border-white py-4 md:border-t-0">
          <div className="mb-6 text-center">
            <h2 className="text-center text-xl font-bold text-white md:text-2xl">
              {userName}
            </h2>
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
  );
}
