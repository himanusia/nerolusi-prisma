"use client";

import { Button } from "~/app/_components/ui/button";
import { getSubtestDisplayName } from "./subtest-utils";

interface SubtestInfoPanelProps {
  currentSubtest?: {
    id?: string;
    type?: string;
    duration?: number;
    _count?: { questions: number };
  };
  isPackageEndDatePassed: boolean;
  packageEndDate: Date | string;
  onStartSubtest: (subtestId: string, duration: number) => void;
  onViewScores: () => void;
}

export function SubtestInfoPanel({
  currentSubtest,
  isPackageEndDatePassed,
  packageEndDate,
  onStartSubtest,
  onViewScores,
}: SubtestInfoPanelProps) {
  if (
    currentSubtest &&
    currentSubtest.id &&
    currentSubtest.type &&
    currentSubtest.duration &&
    currentSubtest._count
  ) {
    const subtestName = getSubtestDisplayName(currentSubtest.type);

    return (
      <div className="w-full max-w-md rounded-sm border-[1px] border-[#acaeba] bg-white p-5 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Sudah siap?</h2>
        <h3 className="text-2xl font-bold text-gray-700">
          {subtestName.short}
        </h3>
        <p className="mb-2 text-gray-600">{subtestName.full}</p>

        <div className="mb-2 flex flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-gray-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-semibold">
              {currentSubtest._count.questions ?? "?"} Soal
            </span>
          </div>

          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-gray-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-semibold">
              {currentSubtest.duration} Menit
            </span>
          </div>
        </div>

        <Button
          variant="default"
          className="text-md font-normal"
          onClick={() =>
            onStartSubtest(currentSubtest.id, currentSubtest.duration)
          }
        >
          Start!
        </Button>
      </div>
    );
  }

  // All subtests completed
  return (
    <div className="w-full max-w-md rounded-sm border-[1px] border-[#acaeba] bg-white p-5 text-center">
      <h3 className="mb-2 text-xl font-bold text-green-700">Selesai! 🎉</h3>
      <p className="mb-6 text-gray-600">Semua subtest telah diselesaikan</p>

      {isPackageEndDatePassed ? (
        <Button
          variant="default"
          className="text-md mb-4 bg-[#2b8057] font-normal hover:bg-[#2b8057]/80"
          onClick={onViewScores}
        >
          Lihat Hasil
        </Button>
      ) : (
        <Button
          variant="default"
          className="text-md mb-4 bg-[#2b8057] font-normal hover:bg-[#2b8057]/80"
          onClick={onViewScores}
        >
          Lihat Status
        </Button>
      )}

      {!isPackageEndDatePassed && (
        <div className="mt-2 text-sm text-gray-500">
          <p>Skor detail akan tersedia setelah:</p>
          <p className="font-semibold">
            {new Date(packageEndDate).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      )}
    </div>
  );
}
