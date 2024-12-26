"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { Textarea } from "~/app/_components/ui/textarea";
import { toast } from "sonner";

const videoSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  url: z.string().url("Invalid URL format"),
});

export type VideoInput = z.infer<typeof videoSchema>;

interface VideoFormProps {
  initialValues?: VideoInput;
  onSubmit: (data: VideoInput) => Promise<void>;
  mode: "add" | "edit";
}

export default function VideoForm({
  initialValues,
  onSubmit,
  mode,
}: VideoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VideoInput>({
    resolver: zodResolver(videoSchema),
    defaultValues: initialValues || {
      title: "",
      description: "",
      url: "",
    },
  });

  const handleFormSubmit = async (data: VideoInput) => {
    try {
      await onSubmit(data);
      toast.success(
        `${mode === "add" ? "Video added" : "Video updated"} successfully!`,
      );
    } catch (error) {
      toast.error(`Failed to ${mode === "add" ? "add" : "update"} video.`);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
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
          {isSubmitting
            ? mode === "add"
              ? "Adding..."
              : "Updating..."
            : mode === "add"
              ? "Add Video"
              : "Update Video"}
        </Button>
      </div>
    </form>
  );
}
