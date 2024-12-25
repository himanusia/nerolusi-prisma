"use client";
import { useRouter } from "next/navigation";
import { Button } from "~/app/_components/ui/button";
import { api } from "~/trpc/react";

export default function FolderPage() {
  const router = useRouter();
  const folders = api.file.getAllFolders.useQuery();

  return (
    <div className="flex size-full flex-col">
      {folders.data?.map((folder) => (
        <Button
          key={folder.id}
          variant={"ghost"}
          className="mb-4"
          onClick={() => router.push(`/file/${folder.id}`)}
        >
          <h2>{folder.name}</h2>
          <p>{folder.description}</p>
        </Button>
      ))}
    </div>
  );
}
