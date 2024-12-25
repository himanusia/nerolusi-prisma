"use client";

import { useParams } from "next/navigation";
import { Button } from "~/app/_components/ui/button";
import { api } from "~/trpc/react";

export default function FilePage() {
  const { id } = useParams();
  const files = api.file.getFilesByFolderId.useQuery({ folderId: Number(id) });

  return (
    <div className="flex size-full flex-col">
      {files.data?.map((file) => (
        <Button
          key={file.id}
          variant={"ghost"}
          className="mb-4"
          onClick={() => window.open(file.url, "_blank")}
        >
          <h2>{file.title}</h2>
          <p>{file.description}</p>
        </Button>
      ))}
    </div>
  );
}
