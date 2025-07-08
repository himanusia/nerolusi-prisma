import { api } from "~/trpc/react";
import RekamanKelasCard from "../_components/rekaman-kelas-card";
import { Skeleton } from "../_components/ui/skeleton";
import { Button } from "../_components/ui/button";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function RekamanTerbaru() {
  const {
    data: videos,
    isLoading: videosLoading,
    isError: videosError,
  } = api.video.getAllVideos.useQuery();

  if (videosLoading) {
    return (
      <div className="flex h-20 w-full flex-col items-center justify-center gap-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 overflow-auto">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Rekaman Kelas Terbaru</h3>
          <p className="text-gray-600">
            Kerjakan Try Out ini untuk melihat hasil belajarmu
          </p>
        </div>
        <Link href={"/rekaman"}>
          <Button variant="outline" size="sm">
            Lihat semua <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {videos.slice(0, 4).map((item) => (
          <div key={item.id} className="flex-shrink-0">
            <RekamanKelasCard
              id={item.id}
              title={item.title}
              description={item.description}
              url={item.url}
              createdAt={new Date(item.createdAt)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
