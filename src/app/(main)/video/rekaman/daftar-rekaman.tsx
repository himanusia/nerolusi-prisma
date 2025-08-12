"use client";
import RekamanKelasCard from "~/app/_components/rekaman-kelas-card";
import { api } from "~/trpc/react";

export default function DaftarRekaman() {
  const {
    data: videos,
    isLoading: videosLoading,
    isError: videosError,
  } = api.video.getAllRekamanVideos.useQuery();

  if (videosLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="h-16 w-full animate-pulse rounded-md bg-gray-200" />
        <div className="h-16 w-full animate-pulse rounded-md bg-gray-200" />
        <div className="h-16 w-full animate-pulse rounded-md bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {videos.map((item) => (
        <RekamanKelasCard
          key={item.id}
          id={item.id}
          title={item.title}
          description={item.description}
          url={item.url}
          createdAt={new Date(item.createdAt)}
          className="bg-gray-100"
        />
      ))}
    </div>
  );
}
