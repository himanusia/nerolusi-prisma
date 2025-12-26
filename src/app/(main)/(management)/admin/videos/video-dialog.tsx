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

interface VideoDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  formData: {
    title: string;
    description: string;
    videoUrl: string;
    duration: number;
    mode: "tka" | "utbk";
  };
  onFormDataChange: (data: any) => void;
  onSubmit: () => void;
  isPending: boolean;
  activeMode: "tka" | "utbk";
}

export function VideoDialog({
  isOpen,
  onOpenChange,
  mode,
  formData,
  onFormDataChange,
  onSubmit,
  isPending,
  activeMode,
}: VideoDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? `Add New ${activeMode.toUpperCase()} Video`
              : "Edit Video"}
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
            <Label>Video Title</Label>
            <Input
              value={formData.title}
              onChange={(e) =>
                onFormDataChange({ ...formData, title: e.target.value })
              }
              placeholder="Enter video title"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                onFormDataChange({ ...formData, description: e.target.value })
              }
              placeholder="Enter description"
              rows={3}
            />
          </div>
          <div>
            <Label>Video URL</Label>
            <Input
              value={formData.videoUrl}
              onChange={(e) =>
                onFormDataChange({ ...formData, videoUrl: e.target.value })
              }
              placeholder="Enter YouTube URL or video ID"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Duration (minutes)</Label>
              <Input
                value={formData.duration}
                onChange={(e) =>
                  onFormDataChange({
                    ...formData,
                    duration: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="(minutes)"
                type="number"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          {mode === "edit" && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}
          <Button onClick={onSubmit} disabled={isPending}>
            {mode === "create" ? "Add Video" : "Update Video"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
