"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/app/_components/ui/dialog";
import { Button } from "~/app/_components/ui/button";

interface SubmitConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalQuestions: number;
  answeredCount: number;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export function SubmitConfirmationDialog({
  open,
  onOpenChange,
  totalQuestions,
  answeredCount,
  onConfirm,
  isSubmitting,
}: SubmitConfirmationDialogProps) {
  const unansweredCount = totalQuestions - answeredCount;
  const allAnswered = unansweredCount === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-gray-800">
            Yakin ingin mengakhiri?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="mb-3 font-bold text-blue-900">Status Jawaban:</h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between rounded bg-white p-2">
                <span className="text-sm font-medium text-gray-700">
                  Total Soal
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {totalQuestions}
                </span>
              </div>

              <div className="flex items-center justify-between rounded bg-green-50 p-2">
                <span className="text-sm font-medium text-green-700">
                  ✓ Soal Terjawab
                </span>
                <span className="text-lg font-bold text-green-700">
                  {answeredCount}
                </span>
              </div>

              {unansweredCount > 0 && (
                <div className="flex items-center justify-between rounded bg-red-50 p-2">
                  <span className="text-sm font-medium text-red-700">
                    ✗ Belum Dijawab
                  </span>
                  <span className="text-lg font-bold text-red-700">
                    {unansweredCount}
                  </span>
                </div>
              )}
            </div>
          </div> */}

          {allAnswered ? (
            <></>
          ) : (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <p className="mb-1 font-bold text-amber-900">Perhatian!</p>
                  <p className="text-sm text-amber-800">
                    Masih ada {unansweredCount} soal yang belum dijawab. Soal
                    yang belum dijawab akan dianggap kosong.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-center text-xs text-gray-600">
              Setelah dikumpulkan, Anda tidak dapat mengubah jawaban lagi
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
            disabled={isSubmitting}
          >
            Periksa Lagi
          </Button>
          <Button
            variant="default"
            onClick={() => {
              onConfirm();
            }}
            className="flex-1 bg-[#2b8057] hover:bg-[#2b8057]/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Mengumpulkan..." : "Ya, Kumpulkan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
