"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { Textarea } from "~/app/_components/ui/textarea";
import { toast } from "sonner";

const folderSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export type FolderInput = z.infer<typeof folderSchema>;

interface FolderFormProps {
  initialValues?: FolderInput;
  onSubmit: (data: FolderInput) => Promise<void>;
  mode: "add" | "edit";
}

export default function FolderForm({
  initialValues,
  onSubmit,
  mode,
}: FolderFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FolderInput>({
    resolver: zodResolver(folderSchema),
    defaultValues: initialValues || {
      name: "",
      description: "",
    },
  });

  const handleFormSubmit = async (data: FolderInput) => {
    try {
      await onSubmit(data);
      toast.success(
        `${mode === "add" ? "Folder added" : "Folder updated"} successfully!`,
      );
    } catch (error) {
      toast.error(`Failed to ${mode === "add" ? "add" : "update"} folder.`);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Name</label>
        <Input
          type="text"
          placeholder="Enter Folder name"
          {...register("name")}
          className="mt-1"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium">Description</label>
        <Textarea
          placeholder="Enter folder description"
          {...register("description")}
          className="mt-1"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? mode === "add"
              ? "Adding..."
              : "Updating..."
            : mode === "add"
              ? "Add Folder"
              : "Update Folder"}
        </Button>
      </div>
    </form>
  );
}
