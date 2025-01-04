"use client";

import { useParams } from "next/navigation";
import { Button } from "~/app/_components/ui/button";
import { api } from "~/trpc/react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/app/_components/ui/dialog";
import { PlusIcon, Trash2Icon } from "lucide-react";
import FileForm, { FileInput } from "./file-forms";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import ErrorPage from "~/app/error";
import LoadingPage from "~/app/loading";

export default function FilePage() {
  const { id } = useParams();
  const folderId = Number(id);
  const { data: session } = useSession();
  const {
    data: files,
    isLoading,
    isError,
    refetch,
  } = api.file.getFilesByFolderId.useQuery({ folderId });
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const addFileMutation = api.file.addFile.useMutation();
  const [editDialogOpen, setEditDialogOpen] = useState(null);
  const editFileMutation = api.file.editFile.useMutation();
  const deleteFileMutation = api.file.deleteFile.useMutation({
    onSuccess: () => {
      toast.success("File deleted successfully!");
      refetch();
    },
    onError: (error) => {
      console.error("Failed to delete file:", error);
      toast.error(error.message || "Failed to delete file.");
    },
  });

  const handleDelete = async (fileId: number) => {
    if (confirm("Are you sure you want to delete this file?")) {
      await deleteFileMutation.mutateAsync({ fileId });
    }
  };

  const handleAddFile = async (data: FileInput) => {
    await addFileMutation.mutateAsync({ ...data, folderId });
    setAddDialogOpen(false);
    refetch();
  };

  const handleEditFile = async (data: FileInput) => {
    await editFileMutation.mutateAsync({ ...data, folderId });
    setEditDialogOpen(false);
    refetch();
  };

  return isError ? (
    <ErrorPage />
  ) : isLoading ? (
    <LoadingPage />
  ) : (
    <div className="mx-auto flex size-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Files</h1>
        {session?.user?.role !== "user" && (
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <PlusIcon className="mr-2 h-5 w-5" />
                Add File
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl p-6">
              <DialogHeader>
                <DialogTitle>Add New File</DialogTitle>
              </DialogHeader>
              <FileForm mode="add" onSubmit={handleAddFile} />
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="flex w-full flex-col rounded-lg border">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex w-full items-center gap-4 border-b"
          >
            <Button
              variant={"ghost"}
              className="flex h-fit w-full flex-col items-start overflow-hidden rounded-none"
              onClick={() => window.open(file.url, "_blank")}
            >
              <h2 className="flex w-full justify-start truncate text-xl font-semibold">
                {file.title}
              </h2>
              <p className="flex w-full justify-start truncate">
                {file.description}
              </p>
            </Button>
            <div
              className={`flex gap-4 ${session?.user?.role === "user" ? "hidden" : ""}`}
            >
              <Dialog
                open={editDialogOpen === file.id}
                onOpenChange={(open) => {
                  if (open) {
                    setEditDialogOpen(file.id);
                  } else {
                    setEditDialogOpen(null);
                  }
                }}
              >
                <DialogTrigger asChild className="w-full">
                  <Button>Edit</Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl p-6">
                  <DialogHeader>
                    <DialogTitle>Edit Folder</DialogTitle>
                  </DialogHeader>
                  <FileForm
                    mode="edit"
                    initialValues={file}
                    onSubmit={handleEditFile}
                  />
                </DialogContent>
              </Dialog>
              <Button
                variant="destructive"
                className="flex items-center"
                onClick={() => handleDelete(file.id!)}
              >
                <Trash2Icon />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
