"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Play, Lock, Loader2 } from "lucide-react";
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
import Link from "next/link";

export default function SubjectMateriPage() {
  const params = useParams();
  const router = useRouter();
  const session = useSession();
  const subject = getSubjectBySlug(params.subject as string);

  const [sections, setSections] = useState<MaterialSection[]>([]);
  const [updatingTopicIds, setUpdatingTopicIds] = useState<Set<number>>(
    new Set(),
  );

  const {
    data: materialData,
    isLoading: isMaterialLoading,
    isError: isMaterialError,
  } = api.materi.getSubjectsMaterial.useQuery({
    subjectName: subject.title,
  });

  const updateUserProgressMutation =
    api.materi.updateUserMaterialProgress.useMutation({
      onMutate: (variables) => {
        const vars = variables as { topicId?: number };
        if (vars?.topicId) {
          setUpdatingTopicIds((prev) => new Set(prev).add(vars.topicId));
        }
      },
      onSettled: (data, error, variables) => {
        const vars = variables as { topicId?: number };
        if (vars?.topicId) {
          setUpdatingTopicIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(vars.topicId);
            return newSet;
          });
        }
      },
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
    const totalSeconds = section.videos.reduce(
      (sum, video) => sum + (video.duration || 0),
      0,
    );
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds < 10 ? "0" : ""}${seconds}s`;
    }
    return `${minutes}m ${seconds < 10 ? "0" : ""}${seconds}s`;
  };

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
          <p className="text-gray-600">
            Marathon LENGKAP materi {subject.title}!
          </p>
        </div>
        <Link href={"/video"}>
          <Button variant="outline" size="sm" className="text-gray-600">
            ← Kembali
          </Button>
        </Link>
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
                <h3 className="md:text-md text-sm font-bold text-black">
                  Materi {section.index} -{" "}
                  {section.title.replace(`Materi ${section.index} - `, "")}
                </h3>
                {section.subtitle && (
                  <p className="mt-1 text-xs text-black md:text-sm">
                    {section.subtitle}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-6">
                <div className="text-xs text-black md:text-sm">
                  <span className="font-bold">{section.videoCount} Videos</span>
                </div>
                <div className="hidden text-xs text-black md:block md:text-sm">
                  <span className="font-bold">
                    Total durasi: {getTotalDuration(section)}
                  </span>
                </div>
                {section.isExpanded ? (
                  <BiSolidDownArrow className="h-3 w-3 text-black md:h-5 md:w-5" />
                ) : (
                  <BiSolidUpArrow className="h-3 w-3 text-black md:h-5 md:w-5" />
                )}
              </div>
            </div>

            {/* Videos List */}
            {section.isExpanded && (
              <div className="bg-white">
                {section.videos.map((video) => (
                  <div
                    key={video.id}
                    className={`flex cursor-pointer flex-row items-center justify-between border-t border-[#acaeba] px-3 py-2 transition-colors hover:bg-gray-50 md:px-6 md:py-4 ${
                      video.isCompleted
                        ? "bg-gradient-to-r from-[#9ad09f] to-[#cbffd0]"
                        : "bg-white"
                    }`}
                    onClick={() => handleVideoClick(video)}
                  >
                    <div className="flex w-full flex-row items-center gap-4 sm:w-auto">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full md:h-10 md:w-10 ${
                          video.isLocked ? "bg-gray-300" : "bg-black"
                        }`}
                      >
                        {video.isLocked ? (
                          <Lock className="h-3 w-3 text-white md:h-5 md:w-5" />
                        ) : (
                          <Play className="h-3 w-3 fill-white text-white md:h-5 md:w-5" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="whitespace-pre-line break-all text-sm font-semibold text-black md:text-lg">
                          {video.title}
                        </h4>
                      </div>

                      <div className="hidden min-w-[100px] text-center md:block">
                        <span className="font-bold text-black">----</span>
                      </div>

                      <div className="hidden min-w-[70px] text-center md:block md:min-w-[120px]">
                        <span className="md:text-md text-sm font-bold text-black">
                          {formatDuration(video.duration)}
                        </span>
                      </div>
                    </div>

                    <div className="ml-1 flex w-full flex-row items-center gap-1 md:ml-0 md:w-auto md:gap-5">
                      {/* Completion Status */}
                      <div className="flex max-w-[100px] flex-row items-center gap-0">
                        <span className="whitespace-nowrap text-center text-xs font-bold text-black md:text-sm">
                          Sudah ditonton:
                        </span>
                        <div className="flex items-center">
                          {updatingTopicIds.has(video.topicId) ? (
                            <Loader2 className="h-4 w-4 animate-spin text-[#2b8057] md:h-6 md:w-6" />
                          ) : video.isCompleted ? (
                            <div className="flex h-4 w-4 items-center justify-center rounded bg-[#35c05f] font-bold text-white md:h-6 md:w-6">
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
                              disabled={
                                video.isLocked ||
                                updatingTopicIds.has(video.topicId)
                              }
                              className="h-3 w-3 rounded border-[#acaeba] text-[#2b8057] focus:ring-[#2b8057] disabled:opacity-50 md:h-5 md:w-5"
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                        </div>
                      </div>

                      {/* Drill Buttons */}
                      <div className="flex max-w-[120px] items-center justify-end md:min-w-[200px] md:gap-2">
                        {video.hasQuiz && (
                          <>
                            {video.drillId && !video.isDrillCompleted ? (
                              <div className="ml-2 flex md:gap-2">
                                <Button
                                  size="sm"
                                  className={`max-w-[60px] p-1 text-xs md:min-h-[40px] md:max-w-[105px] md:p-2 ${
                                    !video.isCompleted || video.isLocked
                                      ? "cursor-not-allowed border-2 border-[#a6a6a6] bg-[#d9d9d9]"
                                      : "border-2 border-white bg-[#ffca28] hover:bg-[#ffca28]/80"
                                  } flex flex-row items-center justify-center whitespace-normal rounded-[5px] text-start font-bold leading-tight text-white`}
                                  disabled={
                                    !video.isCompleted || video.isLocked
                                  }
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDrillClick(video);
                                  }}
                                >
                                  <p className="text-left text-[9px] leading-tight md:text-xs">
                                    Kerjakan Drill Soal
                                  </p>
                                  <RiPencilFill className="hidden md:ml-1 md:block md:h-10 md:w-10" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                className="max-w-[60px] rounded-[5px] border-2 border-white bg-gradient-to-b from-[#223a67] to-[#2d69db] p-1 text-[9px] font-bold text-white hover:bg-blue-600 md:max-w-[100px] md:p-2 md:text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewScoreClick(video);
                                }}
                              >
                                <p>Lihat Hasil</p>
                                <HiOutlineDocumentReport className="ml-1 hidden h-4 w-4 md:block" />
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
        {/* {(sections.length === 0 || sections.length!=0) && (
          <div className="flex items-center justify-center translate-y-[50px]">
            <div className="flex flex-col gap-3 items-center bg-[#2B8057] px-[90px] py-3 max-w-[500px] rounded-3xl">
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
                <p className="text-white font-bold text-3xl text-center mb-2">Dalam proses...</p>
                <p className="text-white font-bold text-sm text-center">Materi akan ditambah 3+ materi perminggunya dan akan 100% komplit pada tanggal 15 September 2025</p>
                <p className="text-white font-bold text-lg text-right pb-[20px]">- Nerolusi</p>
              </div>
            </div>
          </div>
        )} */}
        {/* {sections.length != 0 && (
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
        )} */}
      </div>
    </div>
  );
}
