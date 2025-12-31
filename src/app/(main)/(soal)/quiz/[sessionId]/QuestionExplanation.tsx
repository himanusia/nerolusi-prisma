import Editor from "~/app/_components/editor";
import { getYouTubeVideoId } from "~/utils/get-youtube-id";

interface QuestionExplanationProps {
  explanation: string | null;
  videoExplanation: string | null;
  questionId: number;
}

export function QuestionExplanation({
  explanation,
  videoExplanation,
  questionId,
}: QuestionExplanationProps) {
  return (
    <>
      {/* Text Explanation */}
      {explanation && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm">
          <h4 className="mb-2 font-semibold text-blue-900">Penjelasan:</h4>
          <Editor key={questionId} content={explanation} />
        </div>
      )}

      {/* Video Explanation */}
      {videoExplanation &&
        (() => {
          const youtubeId = getYouTubeVideoId(videoExplanation);

          if (!youtubeId) {
            return (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h4 className="mb-2 font-semibold text-blue-900">
                  Video Penjelasan:
                </h4>
                <div className="flex items-center justify-center">
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
              </div>
            );
          }

          return (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h4 className="mb-2 font-semibold text-blue-900">
                Video Penjelasan:
              </h4>
              <div className="relative w-full">
                <div className="aspect-video overflow-hidden rounded-lg">
                  <iframe
                    className="h-full w-full"
                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0&modestbranding=1`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>
          );
        })()}
    </>
  );
}
