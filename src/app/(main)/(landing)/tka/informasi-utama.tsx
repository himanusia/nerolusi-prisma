"use client";

import { Button } from "~/app/_components/ui/button";
import { getYouTubeVideoId } from "~/utils/get-youtube-id";

interface InformasiUtamaProps {
    videoUrl?: string;
    title?: string;
    description?: string;
}

export default function InformasiUtama({ 
    videoUrl = "https://youtu.be/31bVq2z6mME?si=mFhLh2FsvrU1w41B",
    title = "Informasi Utama TKA!",
    description = "Informasi Utama TKA!"
}: InformasiUtamaProps) {
    const youtubeId = getYouTubeVideoId(videoUrl);

    const handleWatchMore = () => {
        console.log("Watch more clicked");
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 items-center bg-gradient-to-b from-[#bbdefb] via-white to-white w-screen -ml-[50vw] left-1/2 relative py-6 px-[30px] md:px-[100px] border-t border-[#acaeba]">
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
                            <div className="flex items-center justify-center w-full h-full bg-gray-200">
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
            <div className="w-full lg:w-2/3 flex flex-col justify-center space-y-4">
                <div className="text-center lg:text-left">
                    <h1 className="text-2xl lg:text-2xl font-bold text-gray-900">
                        {title}
                    </h1>
                    <p className="text-lg text-gray-600 mb-6">
                        {description}
                    </p>
                    <Button 
                        variant="default"
                        onClick={handleWatchMore}
                    >
                        Watch More &gt;
                    </Button>
                </div>
            </div>
        </div>
    );
}