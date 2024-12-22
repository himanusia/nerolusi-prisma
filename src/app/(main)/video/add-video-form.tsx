"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/trpc/react";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { Textarea } from "~/app/_components/ui/textarea";
import { toast } from "sonner";

const addVideoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  url: z.string().url("Invalid URL format"),
});

type AddVideoInput = z.infer<typeof addVideoSchema>;

export default function AddVideoForm({ onSuccess }: { onSuccess: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AddVideoInput>({
    resolver: zodResolver(addVideoSchema),
  });

  const addVideoMutation = api.video.addVideo.useMutation({
    onSuccess: () => {
      toast.success("Video Added", {
        description: "Video has been successfully added.",
      });
      reset();
      onSuccess();
    },
    onError: () => {
      toast.error("Something went wrong.");
    },
  });

  const onSubmit = async (data: AddVideoInput) => {
    await addVideoMutation.mutateAsync(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Title</label>
        <Input
          type="text"
          placeholder="Enter video title"
          {...register("title")}
          className="mt-1"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium">Description</label>
        <Textarea
          placeholder="Enter video description"
          {...register("description")}
          className="mt-1"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium">YouTube URL</label>
        <Input
          type="url"
          placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
          {...register("url")}
          className="mt-1"
        />
        {errors.url && (
          <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>
        )}
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Video"}
        </Button>
      </div>
    </form>
  );
}
