"use client";

import React, { useState } from "react";
import { Button } from "~/app/_components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/app/_components/ui/tabs";
import { DialogTrigger } from "~/app/_components/ui/dialog";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import LoadingPage from "~/app/loading";
import ErrorPage from "~/app/error";
import { VideoDialog } from "./video-dialog";
import { VideoCard } from "./video-card";
import { VideoFilters } from "./video-filters";
import { EmptyState } from "./empty-state";

export default function VideosPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeMode, setActiveMode] = useState<"tka" | "utbk">("tka");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    duration: 0,
    mode: "tka" as "tka" | "utbk",
    classId: null as number | null,
  });

  const {
    data: videos,
    refetch,
    isLoading,
    isError,
  } = api.admin.getTKAVideos.useQuery();
  
  // Get all classes for dropdown
  const { data: classes } = api.admin.getClasses.useQuery();
  
  const createVideoMutation = api.admin.createVideo.useMutation();
  const updateVideoMutation = api.admin.updateVideo.useMutation();
  const deleteVideoMutation = api.admin.deleteVideo.useMutation();

  // Filter videos by active mode
  const modeFilteredVideos = videos?.filter(
    (video) => video.mode === activeMode,
  );

  const filteredVideos = modeFilteredVideos?.filter((video) => {
    const matchesSearch = video.title
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleCreateVideo = async () => {
    try {
      await createVideoMutation.mutateAsync(formData);
      toast.success("Video created successfully!");
      setIsCreateDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        videoUrl: "",
        duration: 0,
        mode: activeMode,
        classId: null,
      });
      await refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to create video");
    }
  };

  const handleEditVideo = (video: any) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description || "",
      videoUrl: video.url,
      duration: video.duration,
      mode: video.mode || "tka",
      classId: video.classId || null,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateVideo = async () => {
    if (!editingVideo) return;

    try {
      await updateVideoMutation.mutateAsync({
        id: editingVideo.id,
        ...formData,
      });
      toast.success("Video updated successfully!");
      setIsEditDialogOpen(false);
      setEditingVideo(null);
      setFormData({
        title: "",
        description: "",
        videoUrl: "",
        duration: 0,
        mode: activeMode,
        classId: null,
      });
      await refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to update video");
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;

    try {
      await deleteVideoMutation.mutateAsync({ id });
      toast.success("Video deleted successfully!");
      await refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete video");
    }
  };

  if (isError) {
    return <ErrorPage />;
  }

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Videos Management
          </h1>
          <p className="text-gray-600">
            Manage TKA and UTBK video content and materials
          </p>
        </div>
        <Button
          className="bg-red-600 hover:bg-red-700"
          onClick={() => {
            setFormData((prev) => ({ ...prev, mode: activeMode }));
            setIsCreateDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Video
        </Button>
      </div>

      {/* Create Video Dialog */}
      <VideoDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        mode="create"
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleCreateVideo}
        isPending={createVideoMutation.isPending}
        activeMode={activeMode}
        classes={classes}
      />

      {/* Edit Video Dialog */}
      <VideoDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        mode="edit"
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleUpdateVideo}
        isPending={updateVideoMutation.isPending}
        activeMode={activeMode}
        classes={classes}
      />

      {/* Tabs and Content */}
      <Tabs
        value={activeMode}
        onValueChange={(value: any) => setActiveMode(value)}
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="tka">TKA Videos</TabsTrigger>
          <TabsTrigger value="utbk">UTBK Videos</TabsTrigger>
        </TabsList>

        <TabsContent value={activeMode} className="space-y-6">
          {/* Filters */}
          <VideoFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Videos Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredVideos?.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onEdit={handleEditVideo}
                onDelete={handleDeleteVideo}
              />
            ))}
          </div>

          {filteredVideos?.length === 0 && <EmptyState mode={activeMode} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
