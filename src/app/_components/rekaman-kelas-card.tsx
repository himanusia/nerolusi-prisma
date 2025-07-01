"use client";

import { useState } from "react";
import { getYouTubeVideoId } from "~/utils/get-youtube-id";
import { PlayIcon, CalendarIcon } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import Image from "next/image";

interface RekamanKelasCardProps {
  title: string;
  description: string;
  url: string;
  createdAt: Date;
}

export default function RekamanKelasCard({
  title,
  description,
  url,
  createdAt,
}: RekamanKelasCardProps) {
  const youtubeId = getYouTubeVideoId(url);
  const thumbnailUrl = youtubeId
    ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
    : null;

  return (
    <Card className="overflow-hidden border-0">
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
        <h2 className="truncate text-green-600 font-bold ">{title}</h2>
        <div className="truncate text-xs">{description}</div>
        <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
          <CalendarIcon className="h-3 w-3" />
          <span>{createdAt.toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
