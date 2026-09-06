import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/app/_components/ui/dialog";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { Label } from "~/app/_components/ui/label";
import { Textarea } from "~/app/_components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/app/_components/ui/select";
import { UploadSoalField } from "./upload-soal-field";

interface TryoutDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    duration: number;
    maxParticipants: number;
    mode: "tka" | "utbk";
  };
  onFormDataChange: (data: any) => void;
  onSubmit: () => void;
  isPending: boolean;
  activeMode: "tka" | "utbk";
  // BARU: id package yang baru dibuat -> null berarti masih di step 1 (form)
  createdPackageId: string | null;
  // BARU: dipanggil saat upload selesai / admin pilih skip -> tutup modal total
  onFinish: () => void;
}

export function TryoutDialog({
  isOpen,
  onOpenChange,
  formData,
  onFormDataChange,
  onSubmit,
  isPending,
  activeMode,
  createdPackageId,
  onFinish,
}: TryoutDialogProps) {
  const isFormValid =
    formData.name.trim() !== "" &&
    formData.description.trim() !== "" &&
    formData.startDate !== "" &&
    formData.endDate !== "" &&
    formData.duration > 0 &&
    formData.maxParticipants > 0 &&
    new Date(formData.startDate) < new Date(formData.endDate);

  // STEP 2: package sudah dibuat -> tampilkan upload Excel, bukan form lagi
  if (createdPackageId) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Soal</DialogTitle>
          </DialogHeader>
          <UploadSoalField packageId={createdPackageId} onDone={onFinish} />
        </DialogContent>
      </Dialog>
    );
  }

  // STEP 1: form metadata tryout (sama seperti sebelumnya)
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Create New {activeMode.toUpperCase()} Tryout
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Mode</Label>
            <Select
              value={formData.mode}
              onValueChange={(value: "tka" | "utbk") =>
                onFormDataChange({ ...formData, mode: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tka">TKA</SelectItem>
                <SelectItem value="utbk">UTBK</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tryout Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                onFormDataChange({ ...formData, name: e.target.value })
              }
              placeholder="Enter tryout name"
              required
              className={formData.name.trim() === "" ? "border-red-500" : ""}
            />
            {formData.name.trim() === "" && (
              <p className="mt-1 text-sm text-red-500">
                Tryout name is required
              </p>
            )}
          </div>
          <div>
            <Label>Description *</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                onFormDataChange({ ...formData, description: e.target.value })
              }
              placeholder="Enter description"
              rows={3}
              required
              className={
                formData.description.trim() === "" ? "border-red-500" : ""
              }
            />
            {formData.description.trim() === "" && (
              <p className="mt-1 text-sm text-red-500">
                Description is required
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date *</Label>
              <Input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) =>
                  onFormDataChange({ ...formData, startDate: e.target.value })
                }
                required
                className={formData.startDate === "" ? "border-red-500" : ""}
              />
              {formData.startDate === "" && (
                <p className="mt-1 text-sm text-red-500">
                  Start date is required
                </p>
              )}
            </div>
            <div>
              <Label>End Date *</Label>
              <Input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) =>
                  onFormDataChange({ ...formData, endDate: e.target.value })
                }
                required
                className={
                  formData.endDate === "" ||
                  (formData.startDate &&
                    formData.endDate &&
                    new Date(formData.startDate) >= new Date(formData.endDate))
                    ? "border-red-500"
                    : ""
                }
              />
              {formData.endDate === "" && (
                <p className="mt-1 text-sm text-red-500">
                  End date is required
                </p>
              )}
              {formData.startDate &&
                formData.endDate &&
                new Date(formData.startDate) >= new Date(formData.endDate) && (
                  <p className="mt-1 text-sm text-red-500">
                    End date must be after start date
                  </p>
                )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Duration (minutes) *</Label>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  onFormDataChange({
                    ...formData,
                    duration: parseInt(e.target.value) || 0,
                  })
                }
                required
                min="1"
                className={formData.duration <= 0 ? "border-red-500" : ""}
              />
              {formData.duration <= 0 && (
                <p className="mt-1 text-sm text-red-500">
                  Duration must be greater than 0
                </p>
              )}
            </div>
            <div>
              <Label>Max Participants *</Label>
              <Input
                type="number"
                value={formData.maxParticipants}
                onChange={(e) =>
                  onFormDataChange({
                    ...formData,
                    maxParticipants: parseInt(e.target.value) || 0,
                  })
                }
                required
                min="1"
                className={
                  formData.maxParticipants <= 0 ? "border-red-500" : ""
                }
              />
              {formData.maxParticipants <= 0 && (
                <p className="mt-1 text-sm text-red-500">
                  Max participants must be greater than 0
                </p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onSubmit} disabled={isPending || !isFormValid}>
            {isPending ? "Creating..." : "Create Tryout"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
