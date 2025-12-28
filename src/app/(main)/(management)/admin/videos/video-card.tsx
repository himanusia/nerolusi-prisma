import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/app/_components/ui/card";
import { Button } from "~/app/_components/ui/button";
import { Badge } from "~/app/_components/ui/badge";
import { Edit, Trash2, Play } from "lucide-react";
import { getYouTubeVideoId } from "~/utils/get-youtube-id";
import Image from "next/image";

interface VideoCardProps {
  video: {
    id?: string;
    title?: string;
    description?: string | null;
    url?: string;
    duration?: number;
    mode?: "tka" | "utbk" | null;
  };
  onEdit: (video: any) => void;
  onDelete: (id: string) => void;
}

export function VideoCard({ video, onEdit, onDelete }: VideoCardProps) {
  const youtubeId = getYouTubeVideoId(video.url || "");
  const thumbnailUrl = youtubeId
    ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
    : null;
  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{video.title}</CardTitle>
            <p className="mt-1 line-clamp-2 text-sm text-gray-600">
              {video.description}
            </p>
          </div>
          <Badge variant="secondary">{video.mode?.toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-gray-100">
            {thumbnailUrl ? (
              <Image
                src={thumbnailUrl}
                alt={video.title || "Video Thumbnail"}
                width={320}
                height={180}
                className="object-cover"
              />
            ) : (
              <Play className="h-12 w-12 text-gray-400" />
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              {video.duration} min
            </div>
          </div>

          <div className="flex gap-2 pt-3">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onEdit(video)}
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
              onClick={() => onDelete(video.id)}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
