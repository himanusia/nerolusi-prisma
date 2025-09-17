"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/app/_components/ui/card";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { Badge } from "~/app/_components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Plus, Search, Edit, Trash2, Play, Eye } from "lucide-react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "~/app/_components/ui/dialog";
import { Label } from "~/app/_components/ui/label";
import { Textarea } from "~/app/_components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/app/_components/ui/select";
import LoadingPage from "~/app/loading";
import ErrorPage from "~/app/error";

export default function TKAVideosPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    duration: 0,
  });

  const {
    data: videos,
    refetch,
    isLoading,
    isError,
  } = api.admin.getTKAVideos.useQuery();
  const createVideoMutation = api.admin.createTKAVideo.useMutation();
  const updateVideoMutation = api.admin.updateTKAVideo.useMutation();
  const deleteVideoMutation = api.admin.deleteTKAVideo.useMutation();

  const filteredVideos = videos?.filter((video) => {
    const matchesSearch = video.title
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleCreateVideo = async () => {
    try {
      await createVideoMutation.mutateAsync(formData);
      toast.success("TKA Video created successfully!");
      setIsCreateDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        videoUrl: "",
        duration: 0,
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
        <Link href="/admin-tka">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to TKA
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            TKA Videos Management
          </h1>
          <p className="text-gray-600">
            Manage TKA video content and materials
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Video
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New TKA Video</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Video Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter video title"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter description"
                  rows={3}
                />
              </div>
              <div>
                <Label>Video URL</Label>
                <Input
                  value={formData.videoUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, videoUrl: e.target.value })
                  }
                  placeholder="Enter YouTube URL or video ID"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Duration</Label>
                  <Input
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: parseInt(e.target.value),
                      })
                    }
                    placeholder="(minutes)"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreateVideo}
                disabled={createVideoMutation.isPending}
              >
                Add Video
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Video Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit TKA Video</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Video Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter video title"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter description"
                  rows={3}
                />
              </div>
              <div>
                <Label>Video URL</Label>
                <Input
                  value={formData.videoUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, videoUrl: e.target.value })
                  }
                  placeholder="Enter YouTube URL or video ID"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Duration</Label>
                  <Input
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: parseInt(e.target.value),
                      })
                    }
                    placeholder="(minutes)"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateVideo}
                // disabled={updateVideoMutation?.isPending}
              >
                Update Video
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex flex-1 items-center gap-2">
              <Search className="h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {videos?.map((video) => (
          <Card key={video.id} className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{video.title}</CardTitle>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                    {video.description}
                  </p>
                </div>
                {/* <Badge variant="secondary">{video.category}</Badge> */}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                  <Play className="h-12 w-12 text-gray-400" />
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    {video.duration}
                  </div>
                  {/* <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    {video.views || 0} views
                  </div> */}
                </div>

                <div className="flex gap-2 pt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleEditVideo(video)}
                  >
                    <Edit className="mr-1 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(video.url, "_blank")}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteVideo(video.id)}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {videos?.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-gray-500">
              <Play className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <h3 className="mb-2 text-lg font-medium">No TKA videos found</h3>
              <p>Add your first video to get started.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
