/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import { type video } from "~/server/db/schema";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "~/app/_components/ui/dialog";

export default function VideoList() {
  const getVideos = api.video.getAllvideos.useQuery();
  const addVideoApi = api.video.addVideo.useMutation();
  const [videos, setVideos] = useState<video[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");

  useEffect(() => {
    if (getVideos.data) {
      setVideos(getVideos.data);
    }
  }, [getVideos.data]);

  const addNewVideo = async () => {
    if (newVideoTitle && newVideoUrl) {
      try {
        const videoData = {
          title: newVideoTitle,
          url: newVideoUrl,
        };
        const addedVideo = (await addVideoApi.mutateAsync(
          videoData,
        )) as unknown as video;
        setVideos((prev) => [...prev, addedVideo]); // Update local state with the newly added video
        setAddDialogOpen(false); // Close the dialog
        setNewVideoTitle(""); // Clear title input
        setNewVideoUrl(""); // Clear URL input
      } catch (error) {
        console.error("Error adding video:", error);
      }
    }
  };

  // Helper function to extract video ID from different YouTube URL formats
  const extractVideoId = (url: string): string | null => {
    try {
      if (url.includes("youtu.be")) {
        return url.split("youtu.be/")[1]?.split("?")[0] ?? "";
      }
      if (url.includes("youtube.com")) {
        const urlParams = new URLSearchParams(new URL(url).search);
        return urlParams.get("v");
      }
      return null;
    } catch {
      return null;
    }
  };

  const openDialog = (videoId: string) => {
    setSelectedVideoId(videoId);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedVideoId(null);
  };

  return (
    <div>
      <Button onClick={() => setAddDialogOpen(true)} className="mb-4">
        Add Video
      </Button>

      <h2 className="mb-4">Video List</h2>
      {videos.map((video) => {
        const videoId = extractVideoId(video.url);
        return videoId ? (
          <div key={video.id} className="video-item mb-4">
            <img
              src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
              alt={video.title}
              onClick={() => openDialog(videoId)}
              className="cursor-pointer"
            />
            <h3 className="mt-2 text-center">{video.title}</h3>
          </div>
        ) : (
          <p key={video.id} className="text-red-500">
            Invalid video URL
          </p>
        );
      })}

      {isDialogOpen && selectedVideoId && (
        <div className="dialog-backdrop fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="dialog-content rounded-lg bg-white p-4">
            <button onClick={closeDialog} className="mb-2 text-red-500">
              Close
            </button>
            <LiteYouTubeEmbed id={selectedVideoId} title="Video Dialog" />
          </div>
        </div>
      )}

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogTitle>Add New Video</DialogTitle>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Video Title"
              value={newVideoTitle}
              onChange={(e) => setNewVideoTitle(e.target.value)}
            />
            <Input
              type="text"
              placeholder="YouTube URL"
              value={newVideoUrl}
              onChange={(e) => setNewVideoUrl(e.target.value)}
            />
            <Button onClick={addNewVideo} className="w-full">
              Submit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
