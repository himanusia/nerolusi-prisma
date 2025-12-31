"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/app/_components/ui/dialog";
import { Button } from "~/app/_components/ui/button";
import { getSubtestDisplayName } from "./subtest-utils";

interface SubtestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subtest: {
    id?: string;
    type?: string;
    duration?: number;
    _count?: { questions: number };
    quizSession?: Array<{
      endTime?: Date | string | null;
      score?: number | null;
      numCorrect?: number | null;
      numQuestion?: number | null;
    }>;
  } | null;
  isSubmitted: boolean;
  isPackageEndDatePassed: boolean;
  packageEndDate: Date | string;
  onStartSubtest: (subtestId: string, duration: number) => void;
  onViewResults: (subtestId: string) => void;
}

export function SubtestDialog({
  open,
  onOpenChange,
  subtest,
  isSubmitted,
  isPackageEndDatePassed,
  packageEndDate,
  onStartSubtest,
  onViewResults,
}: SubtestDialogProps) {
  if (!subtest || !subtest.id || !subtest.type || !subtest.duration)
    return null;

  const subtestName = getSubtestDisplayName(subtest.type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[350px] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">
            {isSubmitted ? (
              <p className="text-2xl font-bold text-black">
                {isPackageEndDatePassed
                  ? "Lihat Pembahasan"
                  : "Subtest Selesai"}
              </p>
            ) : (
              <p className="text-2xl font-bold text-black">Sudah siap?</p>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-center">
          {isSubmitted ? (
            <>
              <div>
                <h3 className="-mt-4 text-2xl font-bold text-black">
                  {subtest.type.toUpperCase()}
                </h3>
                <p className="text-gray-600">{subtestName.full}</p>
                {subtest.quizSession?.[0]?.score && (
                  <p className="text-lg font-semibold text-green-600">
                    Score: {subtest.quizSession[0].score} |{" "}
                    {subtest.quizSession[0].numCorrect}/
                    {subtest.quizSession[0].numQuestion}
                  </p>
                )}
              </div>

              {isPackageEndDatePassed ? (
                <Button
                  variant="default"
                  className="max-w-lg"
                  onClick={() => {
                    onOpenChange(false);
                    onViewResults(subtest.id);
                  }}
                >
                  Lihat Pembahasan
                </Button>
              ) : (
                <div className="text-sm text-gray-500">
                  <p>Pembahasan akan tersedia setelah:</p>
                  <p className="font-semibold">
                    {new Date(packageEndDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <p className="-mt-4 text-2xl font-bold text-black">
                  {subtest.type.toUpperCase()}
                </p>
                <p className="text-gray-600">{subtestName.full}</p>

                <div className="flex flex-col items-center gap-2">
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
                      {subtest?._count?.questions ?? "?"} Soal
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
                      {subtest.duration} Menit
                    </span>
                  </div>
                </div>
              </div>

              <Button
                variant="default"
                className="max-w-md font-normal"
                onClick={() => {
                  onOpenChange(false);
                  onStartSubtest(subtest.id, subtest.duration);
                }}
              >
                Start!
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
