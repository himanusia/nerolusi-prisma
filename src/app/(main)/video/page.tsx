"use client";

import { use, useState } from "react";
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
import { PlusIcon } from "lucide-react";
import { useSession } from "next-auth/react";

interface Video {
  id?: number;
  title?: string;
  description?: string;
  url?: string;
}

export default function VideoGallery() {
  const session = useSession();
  const {
    data: videos,
    isLoading,
    isError,
    refetch,
  } = api.video.getAllVideos.useQuery();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  if (isLoading) return <div className="mt-10 text-center">Loading...</div>;
  if (isError)
    return (
      <div className="mt-10 text-center text-red-500">
        Error fetching videos.
      </div>
    );

  return (
    <div className="container mx-auto flex size-full flex-col gap-4 p-4 text-center">
      <h1 className="mb-8 text-center text-4xl font-bold">Video Gallery</h1>
      <div
        className={`flex justify-end px-12 ${session?.data.user.role !== "user" ? "" : "hidden"}`}
      >
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
      </div>
      <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
                  setSelectedVideo(video);
                } else {
                  setSelectedVideo(null);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button className="flex size-full flex-col" variant="ghost">
                  <div className="relative">
                    <Image
                      src={thumbnailUrl}
                      alt={video.title}
                      width={320}
                      height={180}
                      className="rounded-md shadow-md transition-opacity hover:opacity-80"
                    />
                  </div>
                  <h2 className="mt-2 size-full truncate text-lg font-semibold">
                    {video.title}
                  </h2>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl p-6">
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
              </DialogContent>
            </Dialog>
          );
        })}
      </div>
    </div>
  );
}
