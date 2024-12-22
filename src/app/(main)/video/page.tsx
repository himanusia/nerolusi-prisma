"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/app/_components/ui/dialog";
import Image from "next/image";
import ReactPlayer from "react-player";
import { api } from "~/trpc/react";
import { getYouTubeVideoId } from "~/utils/get-youtube-id";
import { Button } from "~/app/_components/ui/button";
import AddVideoForm from "./add-video-form";
import { PlusIcon, Trash2Icon } from "lucide-react"; // Tambahkan ikon Trash
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface Video {
  id?: number;
  title?: string;
  description?: string;
  url?: string;
  createdAt?: Date;
}

export default function VideoGallery() {
  const { data: session } = useSession();
  const {
    data: videos,
    isLoading,
    isError,
    refetch,
  } = api.video.getAllVideos.useQuery();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const deleteVideoMutation = api.video.deleteVideo.useMutation({
    onSuccess: () => {
      toast("Video deleted successfully!");
      refetch();
    },
    onError: (error) => {
      console.error("Failed to delete video:", error);
      toast.error(error.message || "Failed to delete video.");
    },
  });

  if (isLoading) return <div className="mt-10 text-center">Loading...</div>;
  if (isError)
    return (
      <div className="mt-10 text-center text-red-500">
        Error fetching videos.
      </div>
    );

  const handleDelete = async (videoId: number) => {
    if (confirm("Are you sure you want to delete this video?")) {
      await deleteVideoMutation.mutateAsync({ id: videoId });
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Header Section */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold">Video Gallery</h1>
        {session?.user?.role !== "user" && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <PlusIcon className="mr-2 h-5 w-5" />
                Add Video
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl p-6">
              <DialogHeader>
                <DialogTitle>Add New Video</DialogTitle>
              </DialogHeader>
              <AddVideoForm
                onSuccess={() => {
                  refetch();
                  setSelectedVideo(null);
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {videos?.map((video) => {
          const videoId = getYouTubeVideoId(video.url);
          const thumbnailUrl = videoId
            ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
            : "/logo.png";

          return (
            <Dialog
              key={video.id}
              open={selectedVideo?.id === video.id}
              onOpenChange={(open) => {
                if (open) {
                  setSelectedVideo({
                    ...video,
                    createdAt: new Date(video.createdAt),
                  });
                } else {
                  setSelectedVideo(null);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  className="flex h-fit w-full flex-col p-0 text-left transition-shadow hover:shadow-lg focus:outline-none"
                  variant="ghost"
                >
                  <div className="relative aspect-video w-full">
                    <Image
                      src={thumbnailUrl}
                      alt={video.title}
                      fill
                      style={{ objectFit: "cover" }}
                      className="rounded-md shadow-md transition-opacity hover:opacity-80"
                    />
                  </div>
                  <h2 className="mt-2 w-full truncate text-lg font-semibold">
                    {video.title}
                  </h2>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl overflow-hidden p-6">
                <DialogHeader>
                  <DialogTitle>{video.title}</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  {videoId ? (
                    <div className="relative pb-[56.25%]">
                      <ReactPlayer
                        url={`https://www.youtube.com/watch?v=${videoId}`}
                        controls
                        width="100%"
                        height="100%"
                        className="absolute left-0 top-0 rounded-md"
                      />
                    </div>
                  ) : (
                    <p>Invalid YouTube URL.</p>
                  )}
                  <p className="mt-4">{video.description}</p>
                </div>
                {/* Tombol Delete dan Close */}
                {session?.user?.role !== "user" && (
                  <div className="mt-6 flex justify-between">
                    <Button
                      variant="destructive"
                      className="flex items-center"
                      onClick={() => handleDelete(video.id!)}
                    >
                      <Trash2Icon className="mr-2 h-5 w-5" />
                      Delete
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          );
        })}
      </div>
    </div>
  );
}
