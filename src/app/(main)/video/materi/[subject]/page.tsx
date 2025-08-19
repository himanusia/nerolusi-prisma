"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Play, Lock } from "lucide-react";
import { Button } from "~/app/_components/ui/button";
import { getSubjectBySlug } from "~/app/_components/constants";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { RiPencilFill } from "react-icons/ri";
import { BiSolidDownArrow, BiSolidUpArrow } from "react-icons/bi";
import { api } from "~/trpc/react";
import { MaterialSection, Video } from "~/server/api/routers/materi";
import LoadingPage from "~/app/loading";
import ErrorPage from "~/app/error";
import NoPackagePage from "~/app/no-package";
import Image from "next/image";

export default function SubjectMateriPage() {
  const params = useParams();
  const router = useRouter();
  const session = useSession();
  const subject = getSubjectBySlug(params.subject as string);

  const [sections, setSections] = useState<MaterialSection[]>([]);

  const {
    data: materialData,
    isLoading: isMaterialLoading,
    isError: isMaterialError,
  } = api.materi.getSubjectsMaterial.useQuery({
    subjectName: subject.title,
  });

  const updateUserProgressMutation =
    api.materi.updateUserMaterialProgress.useMutation({
      onSuccess: (data, variables) => {
        if (variables && variables.topicId) {
          toggleVideoCompleted(variables.topicId);
        }
      },
    });

  useEffect(() => {
    if (materialData) {
      setSections(materialData as MaterialSection[]);
    }
  }, [materialData]);

  const startSessionMutation = api.quiz.createSession.useMutation();
  const getSessionMutation = api.quiz.getSession.useMutation();

  async function goToQuizSession(subtestId: string, duration: number) {
    if (!session.data || !session.data.user) {
      toast.error("Anda harus login terlebih dahulu");
      return;
    }

    const userId = session.data.user.id;

    try {
      let quizSession;

      quizSession = await getSessionMutation.mutateAsync({
        userId,
        subtestId,
      });

      if (!quizSession) {
        quizSession = await startSessionMutation.mutateAsync({
          userId,
          subtestId,
          duration: duration ?? 10000,
        });
      }

      router.push(`/quiz/${quizSession.id}`);
    } catch (error) {
      console.error(error);
      toast.error("Error creating session", {
        description: error.message,
      });
    }
  }

  const toggleSection = (sectionId: number) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? { ...section, isExpanded: !section.isExpanded }
          : section,
      ),
    );
  };
  // updateUserProgressMutation.mutate({
  //   topicId,
  // });

  const toggleVideoCompleted = (topicId: number) => {
    const updatedSections = sections.map((section) => ({
      ...section,
      videos: section.videos.map((video) =>
        video.topicId === topicId
          ? { ...video, isCompleted: !video.isCompleted }
          : video,
      ),
    }));

    // Reapply locking logic after updating completion status
    setSections(updatedSections as MaterialSection[]);
  };

  // const toggleDrillCompleted = (videoId: string) => {
  //   const updatedSections = sections.map((section) => ({
  //     ...section,
  //     videos: section.videos.map((video) =>
  //       video.id === videoId
  //         ? { ...video, isDrillCompleted: !video.isDrillCompleted }
  //         : video,
  //     ),
  //   }));

  //   // Reapply locking logic after updating drill completion status
  //   setSections(updatedSections as MaterialSection[]);
  // };

  const handleVideoClick = (video: Video) => {
    if (video.isLocked) return;

    // Navigate to video player page
    router.push(`/video/${video.id}`);
  };

  const handleDrillClick = (video: Video) => {
    if (!video.isCompleted || video.isLocked) return;

    if (!session.data?.user) {
      toast.error("Anda harus login terlebih dahulu");
      return;
    }

    // Navigate to drill page
    if (subject?.title) {
      // toast.success("Drill belum tersedia untuk materi ini");
      // router.push(`/quiz/${video.id}`);
      goToQuizSession(video.drillId, video.duration);
    } else {
      toast.error("Subject tidak valid untuk drill");
    }
  };

  const handleViewScoreClick = async (video: Video) => {
    if (!video.isDrillCompleted) return;

    // Navigate to drill score page
    if (subject?.title) {
      const userId = session.data?.user.id;
      const quizSession = await getSessionMutation.mutateAsync({
        userId,
        subtestId: video.drillId,
      });

      if (quizSession) {
        router.push(`/quiz/${quizSession.id}`);
      }
    } else {
      toast.error("Subject tidak valid untuk melihat score");
    }
  };

  const handleBack = () => {
    router.push("/video/materi");
  };

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  if (!subject) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Subject not found</p>
      </div>
    );
  }

  const getTotalDuration = (section: MaterialSection) => {
    const totalSeconds = section.videos.reduce((sum, video) => sum + (video.duration || 0),0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds < 10 ? "0" : ""}${seconds}s`;
    }
    return `${minutes}m ${seconds < 10 ? "0" : ""}${seconds}s`;
  }

  if (session.status === "loading") {
    return <LoadingPage />;
  }

  if (!session.data?.user?.enrolledTka) {
    return <NoPackagePage />;
  }

  if (isMaterialLoading) {
    return <LoadingPage />;
  }

  if (isMaterialError) {
    return <ErrorPage />;
  }

  return (
    <div className="flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-[#2b8057]">
            {subject.title}
          </h1>
          <p className="text-gray-600">Marathon LENGKAP materi {subject.title}!</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-gray-600"
          onClick={handleBack}
        >
          ← Kembali
        </Button>
      </div>

      {/* Material Sections */}
      <div className="flex-1 space-y-4">
        {sections.map((section) => (
          <div
            key={section.id}
            className="overflow-hidden rounded-lg border border-[#acaeba]"
          >
            <div
              className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-gray-100"
              onClick={() => toggleSection(section.id)}
            >
              <div className="flex-1">
                <h3 className="font-bold text-black text-sm md:text-md">
                  Materi {section.index} -{" "}
                  {section.title.replace(`Materi ${section.index} - `, "")}
                </h3>
                {section.subtitle && (
                  <p className="mt-1 text-xs md:text-sm text-black">{section.subtitle}</p>
                )}
              </div>

              <div className="flex items-center gap-6">
                <div className="text-xs md:text-sm text-black">
                  <span className="font-bold">{section.videoCount} Videos</span>
                </div>
                <div className="hidden md:block text-xs md:text-sm text-black">
                  <span className="font-bold">
                    Total durasi: {getTotalDuration(section)}
                  </span>
                </div>
                {section.isExpanded ? (
                  <BiSolidDownArrow className="h-3 w-3 md:h-5 md:w-5 text-black" />
                ) : (
                  <BiSolidUpArrow className="h-3 w-3 md:h-5 md:w-5 text-black" />
                )}
              </div>
            </div>

            {/* Videos List */}
            {section.isExpanded && (
              <div className="bg-white">
                {section.videos.map((video) => (
                  <div
                    key={video.id}
                    className={`flex flex-row cursor-pointer items-center justify-between border-t border-[#acaeba] px-3 py-2 md:px-6 md:py-4 transition-colors hover:bg-gray-50 ${
                      video.isCompleted
                        ? "bg-gradient-to-r from-[#9ad09f] to-[#cbffd0]"
                        : "bg-white"
                    }`}
                    onClick={() => handleVideoClick(video)}
                  >
                    <div className="flex w-full sm:w-auto flex-row items-center gap-4">
                      <div
                        className={`flex h-6 w-6 md:h-10 md:w-10 items-center justify-center rounded-full ${
                          video.isLocked ? "bg-gray-300" : "bg-black"
                        }`}
                      >
                        {video.isLocked ? (
                          <Lock className="h-3 w-3 md:h-5 md:w-5 text-white" />
                        ) : (
                          <Play className="h-3 w-3 md:h-5 md:w-5 fill-white text-white" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm md:text-lg font-semibold text-black break-all whitespace-pre-line">
                          {video.title}
                        </h4>
                      </div>

                      <div className="hidden md:block min-w-[100px] text-center">
                        <span className="font-bold text-black">----</span>
                      </div>

                      <div className="hidden md:block min-w-[70px] md:min-w-[120px] text-center">
                        <span className="font-bold text-black text-sm md:text-md">
                          {formatDuration(video.duration)}
                        </span>
                      </div>
                    </div>

                    <div className="flex w-full md:w-auto flex-row items-center gap-1 md:gap-5 ml-1 md:ml-0">
                      {/* Completion Status */}
                      <div className="flex max-w-[100px] flex-row items-center gap-0">
                        <span className="text-center text-xs md:text-sm font-bold text-black whitespace-nowrap">
                          Sudah ditonton:
                        </span>
                        <div className="flex items-center">
                          {video.isCompleted ? (
                            <div className="flex h-4 w-4 md:h-6 md:w-6 items-center justify-center rounded bg-[#35c05f] font-bold text-white">
                              ✓
                            </div>
                          ) : (
                            <input
                              type="checkbox"
                              checked={video.isCompleted}
                              onChange={() =>
                                updateUserProgressMutation.mutate({
                                  topicId: video.topicId,
                                })
                              }
                              disabled={video.isLocked}
                              className="h-3 w-3 md:h-5 md:w-5 rounded border-[#acaeba] text-[#2b8057] focus:ring-[#2b8057] disabled:opacity-50"
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                        </div>
                      </div>

                      {/* Drill Buttons */}
                      <div className="flex max-w-[120px] md:min-w-[200px] items-center justify-end md:gap-2">
                        {video.hasQuiz && (
                          <>
                            {video.drillId && !video.isDrillCompleted ? (
                              <div className="flex ml-2 md:gap-2">
                                <Button
                                  size="sm"
                                  className={`max-w-[60px] md:min-h-[40px] md:max-w-[105px] p-1 md:p-2 text-xs ${
                                    !video.isCompleted || video.isLocked
                                      ? "cursor-not-allowed border-2 border-[#a6a6a6] bg-[#d9d9d9]"
                                      : "border-2 border-white bg-[#ffca28] hover:bg-[#ffca28]/80"
                                  } flex flex-row items-center justify-center whitespace-normal rounded-[5px] text-start font-bold leading-tight text-white`}
                                  disabled={!video.isCompleted || video.isLocked}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDrillClick(video);
                                  }}
                                >
                                  <p className="leading-tight text-[9px] md:text-xs text-left">
                                    Kerjakan Drill Soal
                                  </p>
                                  <RiPencilFill className="hidden md:block md:ml-1 md:h-10 md:w-10" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                className="max-w-[60px] md:max-w-[100px] rounded-[5px] border-2 border-white bg-gradient-to-b from-[#223a67] to-[#2d69db] p-1 md:p-2 text-[9px] md:text-xs font-bold text-white hover:bg-blue-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewScoreClick(video);
                                }}
                              >
                                <p>Lihat Hasil</p>
                                <HiOutlineDocumentReport className="hidden md:block ml-1 h-4 w-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {sections.length === 0 && (
          <div className="flex items-center justify-center translate-y-[100px]">
            <div className="flex flex-col gap-3 items-center bg-[#2B8057] px-[90px] py-3 max-w-[400px] rounded-3xl">
              <div className="bg-white rounded-full p-2">
                <Image
                  src="/logo.png"
                  alt="logo"
                  width={50}
                  height={50}
                  className="object-contain"
                />
              </div>
              <div>
                <p className="text-white font-bold text-3xl text-center">Coming Soon...</p>
                <p className="text-white font-bold text-lg text-right pb-[20px]">- Nerolusi</p>
              </div>
            </div>
          </div>
        )}
        {sections.length != 0 && (
          <div className="flex justify-center translate-y-[50px]">
            <div className="flex flex-col items-center justify-center bg-[#2B8057] px-10 max-w-[400px] rounded-br rounded-bl rounded-3xl">
              <div className="-translate-y-1/2 bg-white rounded-full p-2">
                <Image
                  src="/logo.png"
                  alt="logo"
                  width={50}
                  height={50}
                  className="object-contain"
                />
              </div>
              <p className="text-white font-bold text-3xl -mt-[20px] pb-[20px]">More To Come SOON!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
