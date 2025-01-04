"use client";
import { useRouter } from "next/navigation";
import { Button } from "~/app/_components/ui/button";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/app/_components/ui/dialog";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import FolderForm, { FolderInput } from "./folder-form";
import { useState } from "react";
import ErrorPage from "~/app/error";
import LoadingPage from "~/app/loading";

export default function FolderPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const {
    data: folders,
    isLoading,
    isError,
    refetch,
  } = api.file.getAllFolders.useQuery();

  const deleteFolderMutation = api.file.deleteFolder.useMutation({
    onSuccess: () => {
      toast.success("Folder deleted successfully!");
      refetch();
    },
    onError: (error) => {
      console.error("Failed to delete folder:", error);
      toast.error(error.message || "Failed to delete folder.");
    },
  });

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const addFolderMutation = api.file.addFolder.useMutation();
  const [editDialogOpen, setEditDialogOpen] = useState(null);
  const editFolderMutation = api.file.editFolder.useMutation();

  const handleDelete = async (folderId: number) => {
    if (confirm("Are you sure you want to delete this folder?")) {
      await deleteFolderMutation.mutateAsync({ folderId });
    }
  };

  const handleAddFolder = async (data: FolderInput) => {
    await addFolderMutation.mutateAsync(data);
    setAddDialogOpen(false);
    refetch();
  };

  const handleEditFolder = async (data: FolderInput) => {
    await editFolderMutation.mutateAsync(data);
    setEditDialogOpen(false);
    refetch();
  };

  return isError ? (
    <ErrorPage />
  ) : isLoading ? (
    <LoadingPage />
  ) : (
    <div className="container mx-auto flex flex-col p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Folders</h1>
        {session?.user?.role !== "user" && (
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <PlusIcon className="mr-2 h-5 w-5" />
                Add Folder
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl p-6">
              <DialogHeader>
                <DialogTitle>Add New Folder</DialogTitle>
              </DialogHeader>
              <FolderForm mode="add" onSubmit={handleAddFolder} />
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="mt-4 flex w-full flex-col rounded-lg border">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className="flex w-full items-center justify-between gap-4 border-b"
          >
            <Button
              variant={"ghost"}
              className="flex h-fit w-full flex-col items-start overflow-hidden rounded-none"
              onClick={() => router.push(`/file/${folder.id}`)}
            >
              <h2 className="flex w-full justify-start truncate text-xl font-semibold">
                {folder.name}
              </h2>
              <p className="flex w-full justify-start truncate">
                {folder.description}
              </p>
            </Button>
            <div
              className={`flex gap-4 ${session?.user?.role === "user" ? "hidden" : ""}`}
            >
              <Dialog
                open={editDialogOpen === folder.id}
                onOpenChange={(open) => {
                  if (open) {
                    setEditDialogOpen(folder.id);
                  } else {
                    setEditDialogOpen(null);
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button>Edit</Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl p-6">
                  <DialogHeader>
                    <DialogTitle>Edit Folder</DialogTitle>
                  </DialogHeader>
                  <FolderForm
                    mode="edit"
                    initialValues={folder}
                    onSubmit={handleEditFolder}
                  />
                </DialogContent>
              </Dialog>
              <Button
                variant="destructive"
                onClick={() => handleDelete(folder.id!)}
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
