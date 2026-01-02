"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/app/_components/ui/dialog";
import { Button } from "~/app/_components/ui/button";

interface StartConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subtestName: string;
  duration: number;
  questionCount: number;
  onConfirm: () => void;
}

export function StartConfirmationDialog({
  open,
  onOpenChange,
  subtestName,
  duration,
  questionCount,
  onConfirm,
}: StartConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-gray-800">
            Perhatian!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <h3 className="mb-2 font-bold text-amber-900">
              Anda akan memulai:
            </h3>
            <p className="text-lg font-semibold text-gray-800">{subtestName}</p>
            <div className="mt-3 space-y-1 text-sm text-gray-700">
              <p>• {questionCount} soal</p>
              <p>• Durasi: {duration} menit</p>
            </div>
          </div>

          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-2">
              <span className="text-xl text-red-600">⏱️</span>
              <div className="flex-1">
                <p className="mb-1 font-bold text-red-900">
                  Penting untuk Diperhatikan:
                </p>
                <ul className="list-inside list-disc space-y-1 text-sm text-red-800">
                  <li>Timer akan langsung dimulai setelah Anda klik "Mulai"</li>
                  <li>Timer tidak dapat dihentikan atau direset</li>
                  <li>Pastikan koneksi internet Anda stabil</li>
                  <li>Pastikan Anda memiliki waktu yang cukup</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Batal
          </Button>
          <Button
            variant="default"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="flex-1 bg-[#2b8057] hover:bg-[#2b8057]/90"
          >
            Saya Siap, Mulai!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
