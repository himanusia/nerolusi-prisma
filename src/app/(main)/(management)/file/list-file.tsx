/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { type file } from "~/server/db/schema"; // Ensure this is the correct import path
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "~/app/_components/ui/dialog";
import { UploadButton } from "~/utils/uploadthing";

export default function FileList() {
  const getFiles = api.file.getAllFiles.useQuery();
  const uploadFileApi = api.file.uploadFile.useMutation();
  const [files, setFiles] = useState<file[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newFileTitle, setNewFileTitle] = useState("");

  useEffect(() => {
    if (Array.isArray(getFiles.data)) {
      setFiles(getFiles.data); // TypeScript should infer the type correctly
    }
  }, [getFiles.data]);

  const handleFileUpload = async (res: { name: string; appUrl: string }[]) => {
    if (res[0]) {
      try {
        const fileData = {
          title: res[0].name,
          description: "Uploaded file",
          url: res[0].appUrl,
        };
        const uploadedFile = (await uploadFileApi.mutateAsync(
          fileData,
        )) as unknown as file;
        setFiles((prev) => [...prev, uploadedFile]);
        setAddDialogOpen(false);
        setNewFileTitle("");
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error uploading file:", error.message);
        } else {
          console.error("Error uploading file:", error);
        }
      }
    }
  };

  return (
    <div>
      <Button onClick={() => setAddDialogOpen(true)} className="mb-4">
        Add File
      </Button>

      <h2 className="mb-4">File List</h2>
      {files.map((file) => (
        <div key={file.id} className="file-item mb-4">
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            {file.title}
          </a>
        </div>
      ))}

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogTitle>Add New File</DialogTitle>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="File Title"
              value={newFileTitle}
              onChange={(e) => setNewFileTitle(e.target.value)}
            />
            <UploadButton
              className="border"
              endpoint="fileUploader"
              onClientUploadComplete={handleFileUpload}
              onUploadError={(error: Error) => {
                alert(`ERROR! ${error.message}`);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
