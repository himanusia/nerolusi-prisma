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

  if (isLoading) return <div className="mt-10 text-center">Loading...</div>;
  if (isError)
    return (
      <div className="mt-10 text-center text-red-500">
        Error fetching folders.
      </div>
    );

  return (
    <div className="flex size-full flex-col">
      <h1 className="mb-4 text-2xl font-semibold">Folders</h1>
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
      {folders.map((folder) => (
        <div className="flex w-full items-center justify-between gap-4 border-b p-4">
          <Button
            key={folder.id}
            variant={"ghost"}
            className="size-full"
            onClick={() => router.push(`/file/${folder.id}`)}
          >
            <div>
              <h2>{folder.name}</h2>
              <p>{folder.description}</p>
            </div>
            {session?.user?.role !== "user" && (
              <div className="mt-6 flex justify-between"></div>
            )}
          </Button>
          <div className="flex gap-4">
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
              className="flex items-center"
              onClick={() => handleDelete(folder.id!)}
            >
              <Trash2Icon className="mr-2 h-5 w-5" />
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
