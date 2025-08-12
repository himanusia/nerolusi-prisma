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
import VideoForm, { VideoInput } from "./video-form";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import ErrorPage from "~/app/error";
import LoadingPage from "~/app/loading";

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
      toast.success("Video deleted successfully!");
      refetch();
    },
    onError: (error) => {
      console.error("Failed to delete video:", error);
      toast.error(error.message || "Failed to delete video.");
    },
  });
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const addVideoMutation = api.video.addVideo.useMutation();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const editVideoMutation = api.video.editVideo.useMutation();

  const handleAddVideo = async (data: VideoInput) => {
    await addVideoMutation.mutateAsync(data);
    setAddDialogOpen(false);
    refetch();
  };

  const handleEditVideo = async (data: VideoInput) => {
    await editVideoMutation.mutateAsync(data);
    setEditDialogOpen(false);
    setSelectedVideo(null);
    refetch();
  };

  const handleDelete = async (videoId: number) => {
    if (confirm("Are you sure you want to delete this video?")) {
      await deleteVideoMutation.mutateAsync({ id: videoId });
    }
  };

  return isError ? (
    <ErrorPage />
  ) : isLoading ? (
    <LoadingPage />
  ) : (
    <div className="container mx-auto flex flex-col gap-5 p-4">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Video Gallery</h1>
        {session?.user?.role !== "user" && (
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
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
              <VideoForm mode="add" onSubmit={handleAddVideo} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Grid Section */}
      <div className="grid size-full grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
                  className="flex size-full flex-col border transition-shadow hover:shadow-lg focus:outline-none"
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
                  <span className="w-full truncate text-lg font-semibold">
                    {video.title}
                  </span>
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

                {session?.user?.role !== "user" && (
                  <div className="mt-6 flex justify-between">
                    <Button
                      variant="destructive"
                      className="flex items-center"
                      onClick={() => handleDelete(video.id!)}
                    >
                      <Trash2Icon />
                    </Button>
                    <Dialog
                      open={editDialogOpen}
                      onOpenChange={setEditDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button>Edit</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-xl p-6">
                        <DialogHeader>
                          <DialogTitle>Edit Video</DialogTitle>
                        </DialogHeader>
                        {selectedVideo && (
                          <VideoForm
                            mode="edit"
                            initialValues={selectedVideo}
                            onSubmit={handleEditVideo}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
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
