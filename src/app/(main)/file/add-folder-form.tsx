"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/trpc/react";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { Textarea } from "~/app/_components/ui/textarea";
import { toast } from "sonner";

const addFolderSchema = z.object({
  name: z.string().min(1, "name is required"),
  description: z.string().optional(),
});

type AddFolderInput = z.infer<typeof addFolderSchema>;

export default function AddFolderForm({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AddFolderInput>({
    resolver: zodResolver(addFolderSchema),
  });

  const addFolderMutation = api.file.addFolder.useMutation({
    onSuccess: () => {
      toast.success("Folder Added", {
        description: "Folder has been successfully added.",
      });
      reset();
      onSuccess();
    },
    onError: () => {
      toast.error("Something went wrong.");
    },
  });

  const onSubmit = async (data: AddFolderInput) => {
    await addFolderMutation.mutateAsync(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">name</label>
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
          placeholder="Enter Folder description"
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
          {isSubmitting ? "Adding..." : "Add Folder"}
        </Button>
      </div>
    </form>
  );
}
