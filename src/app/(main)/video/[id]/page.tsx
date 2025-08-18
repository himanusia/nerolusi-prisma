"use client";
import { useParams } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/app/_components/ui/avatar";
import { Button } from "~/app/_components/ui/button";
import ErrorPage from "~/app/error";
import LoadingPage from "~/app/loading";
import { api } from "~/trpc/react";
import { getYouTubeVideoId } from "~/utils/get-youtube-id";

export default function NontonPage() {
  const params = useParams();
  const { id } = params;
  const {
    data: video,
    isLoading,
    isError,
  } = api.video.getVideoById.useQuery({
    id: id as string,
  });

  if (isLoading) {
    return <LoadingPage />;
  }

  if (isError || !video) {
    return <ErrorPage />;
  }

  const youtubeId = getYouTubeVideoId(video.url);

  if (!youtubeId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl">⚠️</div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800">
            Invalid Video URL
          </h2>
          <p className="text-gray-600">
            This doesn't appear to be a valid YouTube video.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Back Button */}
      <div className="mb-6">
        <Button onClick={() => window.history.back()} variant="outline">
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back
        </Button>
      </div>
      <div className="overflow-hidden rounded-lg shadow-lg">
        {/* Video Player */}
        <div className="relative w-full">
          <div className="aspect-video overflow-hidden rounded-lg">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0&modestbranding=1`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        {/* Video Info */}
        <div className="rounded-lg bg-white p-6">
          <h1 className="mb-4 font-bold text-gray-900 md:text-xl">
            {video.title}
          </h1>

          {video.description && (
            <div className="mb-4">
              <p className="md:text-md whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
                {video.description}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between border-t pt-4 text-xs text-gray-500 md:text-sm">
            <span>
              {new Date(video.createdAt).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Tutor Information */}
      {/* <div className="mt-6 overflow-auto rounded-lg border border-gray-400 bg-white p-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex flex-1 items-center space-x-4">
            <Avatar className="flex size-12 items-center justify-center md:size-16">
              <AvatarImage src="" alt="Tutor Avatar" />
              <AvatarFallback>KA</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-gray-900 md:text-xl">Ka Ananda</h3>
              <p className="md:text-md text-sm text-gray-600">
                Tutor PPU, KPU, dan PBM
              </p>
            </div>
          </div>
          <Button className="w-full space-x-2 sm:w-fit sm:shrink-0">
            <FaWhatsapp className="h-5 w-5" />
            <span>Kontak</span>
          </Button>
        </div>
      </div> */}
    </div>
  );
}
