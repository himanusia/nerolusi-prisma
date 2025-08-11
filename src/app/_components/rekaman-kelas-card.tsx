"use client";

import { getYouTubeVideoId } from "~/utils/get-youtube-id";
import { PlayIcon, CalendarIcon } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface RekamanKelasCardProps {
  id: string;
  title: string;
  description: string;
  url: string;
  createdAt: Date;
  className?: string;
}

export default function RekamanKelasCard({
  id,
  title,
  description,
  url,
  createdAt,
  className = "",
}: RekamanKelasCardProps) {
  const youtubeId = getYouTubeVideoId(url);
  const thumbnailUrl = youtubeId
    ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
    : null;

  const router = useRouter();
  return (
    <Card
      className={`overflow-hidden border-0 transition-all duration-100 hover:scale-105 hover:cursor-pointer ${className}`}
      onClick={() => router.push(`/rekaman/${id}`)}
    >
      <Link href={`rekaman/${id}`}>
        <div className="relative aspect-video">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={title}
              className="h-full w-full rounded-t-lg object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-t-lg bg-gradient-to-br from-blue-400 to-purple-600">
              <PlayIcon className="h-12 w-12 text-white" />
            </div>
          )}
        </div>
        <CardContent className="p-3">
          <h2 className="truncate font-bold text-green-600">{title}</h2>
          <div className="truncate text-xs">{description}</div>
          <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
            <CalendarIcon className="h-3 w-3" />
            <span>{createdAt.toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
