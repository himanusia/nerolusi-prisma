"use client";
// import { api } from "~/trpc/react";
// import { UploadButton } from "~/utils/uploadthing";
import FileList from "./list-file";

export default function Page() {
  // const uploadFile = api.file.uploadFile.useMutation();

  return (
    <div className="flex size-full items-center justify-center">
      {/* <UploadButton
        className="border"
        endpoint="fileUploader"
        onClientUploadComplete={(res) => {
          console.log("Files: ", res);
          alert("Upload Completed");
          uploadFile.mutate({
            title: res[0]?.name ?? "",
            description: "Uploaded file",
            url: res[0]?.appUrl ?? "",
          });
        }}
        onUploadError={(error: Error) => {
          alert(`ERROR! ${error.message}`);
        }}
      /> */}
      <FileList />
    </div>
  );
}
