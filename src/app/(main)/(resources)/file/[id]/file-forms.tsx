"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { Textarea } from "~/app/_components/ui/textarea";
import { toast } from "sonner";
import { UploadDropzone } from "~/utils/uploadthing";
import { useState } from "react";

const fileSchema = z.object({
  id: z.number().optional(),
  folderId: z.number(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  url: z.string().url("Invalid URL format"),
});

export type FileInput = z.infer<typeof fileSchema>;

interface FileFormProps {
  initialValues?: FileInput;
  onSubmit: (data: FileInput) => Promise<void>;
  mode: "add" | "edit";
}

export default function FileForm({
  initialValues,
  onSubmit,
  mode,
}: FileFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FileInput>({
    resolver: zodResolver(fileSchema),
    defaultValues: initialValues || {
      title: "",
      description: "",
      url: "",
      folderId: 0,
    },
  });
  const [uploadedUrl, setUploadUrl] = useState(getValues("url"));

  const handleFormSubmit = async (data: FileInput) => {
    try {
      await onSubmit(data);
      toast.success(
        `${mode === "add" ? "File added" : "File updated"} successfully!`,
      );
    } catch (error) {
      toast.error(`Failed to ${mode === "add" ? "add" : "update"} File.`);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Title</label>
        <Input
          type="text"
          placeholder="Enter File name"
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
          placeholder="Enter File description"
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
        <label className="block text-sm font-medium">File</label>
        <UploadDropzone
          className="rounded-lg border"
          endpoint="pdfUploader"
          onClientUploadComplete={(res) => {
            if (res && res[0]?.url) {
              setValue("url", res[0].url);
              setUploadUrl(res[0].url);
              toast.success("File uploaded successfully!");
            }
          }}
          onUploadError={() => {
            toast.error("Failed to upload file.");
          }}
        />
        {errors.url && (
          <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>
        )}
        {uploadedUrl && (
          <Button
            type="button"
            variant="outline"
            className="mt-2 w-full"
            onClick={() => window.open(uploadedUrl, "_blank")}
          >
            View Uploaded File
          </Button>
        )}
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? mode === "add"
              ? "Adding..."
              : "Updating..."
            : mode === "add"
              ? "Add File"
              : "Update File"}
        </Button>
      </div>
    </form>
  );
}
