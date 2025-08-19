"use client";

import { Button } from "~/app/_components/ui/button";
import { getYouTubeVideoId } from "~/utils/get-youtube-id";

interface InformasiUtamaProps {
  videoUrl?: string;
  title?: string;
  description?: string;
}

export default function InformasiUtama({
  videoUrl = "https://youtu.be/Ndwc6qKl1LY",
  title = "Informasi Utama TKA!",
  description = "Informasi Utama TKA!",
}: InformasiUtamaProps) {
  const youtubeId = getYouTubeVideoId(videoUrl);

  const handleWatchMore = () => {
    console.log("Watch more clicked");
  };

  return (
    <div className="relative left-1/2 -ml-[50vw] flex w-screen flex-col items-center gap-6 border-t border-[#acaeba] bg-gradient-to-b from-[#bbdefb] via-white to-white px-[30px] py-6 md:px-[100px] lg:flex-row">
      {/* Video Player */}
      <div className="w-full lg:w-3/5">
        <div className="relative w-full">
          <div className="aspect-video overflow-hidden rounded-lg shadow-lg">
            {youtubeId ? (
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0&modestbranding=1`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-200">
                <div className="text-center">
                  <div className="mb-4 text-4xl">🎥</div>
                  <p className="text-gray-600">No video available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Information Panel */}
      <div className="flex w-full flex-col justify-center space-y-4 lg:w-2/3">
        <div className="text-center lg:text-left">
          <h1 className="text-2xl font-bold text-gray-900 lg:text-2xl">
            {title}
          </h1>
          <p className="mb-6 text-lg text-gray-600">{description}</p>
          {/* <Button variant="default" onClick={handleWatchMore}>
            Watch More &gt;
          </Button> */}
        </div>
      </div>
    </div>
  );
}
