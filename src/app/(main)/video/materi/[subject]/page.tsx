"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Play, Lock } from "lucide-react";
import { Button } from "~/app/_components/ui/button";
import { getSubjectBySlug } from "~/app/_components/constants";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { RiPencilFill } from "react-icons/ri";
import { BiSolidDownArrow, BiSolidUpArrow  } from "react-icons/bi";


interface Video {
  id: number;
  title: string;
  duration: string;
  isCompleted: boolean;
  isLocked?: boolean;
  hasQuiz?: boolean;
  isDrillCompleted?: boolean;
}

interface MaterialSection {
  id: number;
  title: string;
  subtitle?: string;
  videoCount: number;
  totalDuration: string;
  videos: Video[];
  isExpanded: boolean;
}

export default function SubjectMateriPage() {
  const params = useParams();
  const router = useRouter();
  const session = useSession();
  const subject = getSubjectBySlug(params.subject as string);

  // Function to check if a video should be unlocked
  const isVideoUnlocked = (videoId: number, sections: MaterialSection[]): boolean => {
    // First video is always unlocked
    if (videoId === 1) return true;
    
    // Find the previous video
    const allVideos = sections.flatMap(section => section.videos);
    const currentVideoIndex = allVideos.findIndex(v => v.id === videoId);
    
    if (currentVideoIndex <= 0) return true; // First video or not found
    
    const previousVideo = allVideos[currentVideoIndex - 1];
    if (!previousVideo) return true;
    
    // Previous video must be completed AND have its drill completed (if it has a quiz)
    return previousVideo.isCompleted && 
           (!previousVideo.hasQuiz || previousVideo.isDrillCompleted);
  };

  // Update the sections state to apply the locking logic
  const updateVideoLockStatus = (sections: MaterialSection[]): MaterialSection[] => {
    return sections.map(section => ({
      ...section,
      videos: section.videos.map(video => ({
        ...video,
        isLocked: !isVideoUnlocked(video.id, sections)
      }))
    }));
  };

  const [sections, setSections] = useState<MaterialSection[]>(
    updateVideoLockStatus([
    {
      id: 1,
      title: "Materi 1 - Bilangan dan Aljabar",
      videoCount: 4,
      totalDuration: "1 jam 3 menit",
      isExpanded: true,
      videos: [
        {
          id: 1,
          title: "Teori Bilangan",
          duration: "12 minutes",
          isCompleted: true,
          hasQuiz: true,
          isDrillCompleted: true,
        },
        {
          id: 2,
          title: "Operasi Bilangan",
          duration: "7 minutes",
          isCompleted: true,
          hasQuiz: true,
          isDrillCompleted: false,
        },
        {
          id: 3,
          title: "Aritmatika Sosial",
          duration: "23 minutes",
          isCompleted: false,
          isLocked: true,
          hasQuiz: true,
          isDrillCompleted: false,
        },
        {
          id: 4,
          title: "Konsep aljabar",
          duration: "5 minutes",
          isCompleted: false,
          isLocked: true,
          hasQuiz: true,
          isDrillCompleted: false,
        },
      ],
    },
    {
      id: 2,
      title: "Sistem Persamaan Linear, Pertidaksamaan Linear, dan Program Linear",
      videoCount: 2,
      totalDuration: "51 menit",
      isExpanded: false,
      videos: [
        {
          id: 5,
          title: "Sistem Persamaan Linear",
          duration: "30 minutes",
          isCompleted: false,
          isLocked: true,
          hasQuiz: true,
          isDrillCompleted: false,
        },
        {
          id: 6,
          title: "Program Linear",
          duration: "21 minutes",
          isCompleted: false,
          isLocked: true,
          hasQuiz: true,
          isDrillCompleted: false,
        },
      ],
    },
    {
      id: 3,
      title: "Himpunan dan Fungsi",
      videoCount: 4,
      totalDuration: "48 menit",
      isExpanded: false,
      videos: [
        {
          id: 7,
          title: "Konsep Himpunan",
          duration: "15 minutes",
          isCompleted: false,
          isLocked: true,
          hasQuiz: true,
          isDrillCompleted: false,
        },
        {
          id: 8,
          title: "Operasi Himpunan",
          duration: "12 minutes",
          isCompleted: false,
          isLocked: true,
          hasQuiz: true,
          isDrillCompleted: false,
        },
        {
          id: 9,
          title: "Fungsi Linear",
          duration: "11 minutes",
          isCompleted: false,
          isLocked: true,
          hasQuiz: true,
          isDrillCompleted: false,
        },
        {
          id: 10,
          title: "Fungsi Kuadrat",
          duration: "10 minutes",
          isCompleted: false,
          isLocked: true,
          hasQuiz: true,
          isDrillCompleted: false,
        },
      ],
    },
    {
      id: 4,
      title: "Persamaan dan Fungsi Kuadrat",
      videoCount: 8,
      totalDuration: "1 jam 21 menit",
      isExpanded: false,
      videos: [
        {
          id: 11,
          title: "Pengertian Persamaan Kuadrat",
          duration: "12 minutes",
          isCompleted: false,
          isLocked: true,
          hasQuiz: true,
          isDrillCompleted: false,
        },
        {
          id: 12,
          title: "Menyelesaikan Persamaan Kuadrat",
          duration: "15 minutes",
          isCompleted: false,
          isLocked: true,
          hasQuiz: true,
          isDrillCompleted: false,
        },
        {
          id: 13,
          title: "Diskriminan",
          duration: "8 minutes",
          isCompleted: false,
          isLocked: true,
          hasQuiz: true,
          isDrillCompleted: false,
        },
        {
          id: 14,
          title: "Fungsi Kuadrat",
          duration: "18 minutes",
          isCompleted: false,
          isLocked: true,
          hasQuiz: true,
          isDrillCompleted: false,
        },
        {
          id: 15,
          title: "Grafik Fungsi Kuadrat",
          duration: "12 minutes",
          isCompleted: false,
          isLocked: true,
          hasQuiz: true,
          isDrillCompleted: false,
        },
        {
          id: 16,
          title: "Aplikasi Fungsi Kuadrat",
          duration: "16 minutes",
          isCompleted: false,
          isLocked: true,
          hasQuiz: true,
          isDrillCompleted: false,
        },
      ],
    },
  ])
);

  const toggleSection = (sectionId: number) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, isExpanded: !section.isExpanded }
        : section
    ));
  };

  const toggleVideoCompleted = (videoId: number) => {
    const updatedSections = sections.map(section => ({
      ...section,
      videos: section.videos.map(video => 
        video.id === videoId 
          ? { ...video, isCompleted: !video.isCompleted }
          : video
      )
    }));
    
    // Reapply locking logic after updating completion status
    setSections(updateVideoLockStatus(updatedSections));
  };

  const toggleDrillCompleted = (videoId: number) => {
    const updatedSections = sections.map(section => ({
      ...section,
      videos: section.videos.map(video => 
        video.id === videoId 
          ? { ...video, isDrillCompleted: !video.isDrillCompleted }
          : video
      )
    }));
    
    // Reapply locking logic after updating drill completion status
    setSections(updateVideoLockStatus(updatedSections));
  };

  const handleVideoClick = (video: Video) => {
    if (video.isLocked) return;
    
    // Navigate to video player page
    router.push(`/video/materi/${params.subject}/${video.id}`);
  };

  const handleDrillClick = (video: Video) => {
    if (!video.isCompleted || video.isLocked) return;

    if (!session.data?.user) {
      toast.error("Anda harus login terlebih dahulu");
      return;
    }

    // Navigate to drill page
    if (subject?.title) {
      toast.success("Drill belum tersedia untuk materi ini");
    } else {
      toast.error("Subject tidak valid untuk drill");
    }
  };

  const handleViewScoreClick = (video: Video) => {
    if (!video.isDrillCompleted) return;

    // Navigate to drill score page
    if (subject?.title) {
      toast.success("Hasil belum tersedia untuk materi ini");
    } else {
      toast.error("Subject tidak valid untuk melihat score");
    }
  };

  // Simulate drill completion
  const simulateDrillCompletion = (videoId: number) => {
    toggleDrillCompleted(videoId);
    toast.success("Drill completed! Next video unlocked.");
  };

  const handleBack = () => {
    router.push('/video/materi');
  };

  if (!subject) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Subject not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#2b8057] mb-1">{subject.title}</h1>
          <p className="text-gray-600">Marathon LENGKAP materi PK!</p>
        </div>
        <Button variant="outline" size="sm" className="text-gray-600" onClick={handleBack}>
          ← Kembali
        </Button>
      </div>

      {/* Material Sections */}
      {sections.map((section) => (
        <div key={section.id} className="border border-[#acaeba] rounded-lg overflow-hidden">
          <div 
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => toggleSection(section.id)}
          >
            <div className="flex-1">
              <h3 className="font-bold text-black">
                Materi {section.id} - {section.title.replace(`Materi ${section.id} - `, '')}
              </h3>
              {section.subtitle && (
                <p className="text-sm text-black mt-1">{section.subtitle}</p>
              )}
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-sm text-black">
                <span className="font-bold">{section.videoCount} Videos</span>
              </div>
              <div className="text-sm text-black">
                <span className="font-bold">Total durasi: {section.totalDuration}</span>
              </div>
              {section.isExpanded ? (
                <BiSolidDownArrow className="w-5 h-5 text-black" />
              ) : (
                <BiSolidUpArrow className="w-5 h-5 text-black" />
              )}
            </div>
          </div>

          {/* Videos List */}
          {section.isExpanded && (
            <div className="bg-white">
              {section.videos.map((video) => (
                <div 
                  key={video.id} 
                  className={`flex items-center justify-between px-6 py-4 border-t border-[#acaeba] hover:bg-gray-50 transition-colors cursor-pointer ${
                    video.isCompleted ? 'bg-gradient-to-r from-[#9ad09f] to-[#cbffd0]' : 'bg-white'
                  }`}
                  onClick={() => handleVideoClick(video)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      video.isLocked ? 'bg-gray-300' : 'bg-black'
                    }`}>
                      {video.isLocked ? (
                        <Lock className="w-5 h-5 text-white" />
                      ) : (
                        <Play className="w-5 h-5 text-white fill-white" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold text-black text-lg">
                        {video.title}
                      </h4>
                    </div>

                    <div className="text-center min-w-[100px]">
                      <span className="text-black font-bold">----</span>
                    </div>

                    <div className="text-center min-w-[120px]">
                      <span className="text-black font-bold">{video.duration}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    {/* Completion Status */}
                    <div className="flex flex-row items-center max-w-[100px] gap-0">
                      <span className="text-sm text-black font-bold text-center">
                        Sudah ditonton:
                      </span>
                      <div className="flex items-center ">
                        {video.isCompleted ? (
                          <div className="w-6 h-6 bg-[#35c05f] rounded flex items-center justify-center text-white font-bold">
                            ✓
                          </div>
                        ) : (
                          <input
                            type="checkbox"
                            checked={video.isCompleted}
                            onChange={() => toggleVideoCompleted(video.id)}
                            disabled={video.isLocked}
                            className="w-5 h-5 rounded border-[#acaeba] text-[#2b8057] focus:ring-[#2b8057] disabled:opacity-50"
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                      </div>
                    </div>
                    
                    {/* Drill Buttons */}
                    <div className="flex items-center gap-2 min-w-[200px] justify-end">
                      {video.hasQuiz && (
                        <>
                          {!video.isDrillCompleted ? (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                className={`text-xs p-2 max-w-[105px] min-h-[40px] ${
                                  !video.isCompleted || video.isLocked 
                                    ? 'bg-[#d9d9d9] cursor-not-allowed border-2 border-[#a6a6a6]' 
                                    : 'bg-[#ffca28] hover:bg-[#ffca28]/80 border-2 border-white'
                                } text-white rounded-[5px] font-bold flex flex-row items-center justify-center whitespace-normal text-start leading-tight`}
                                disabled={!video.isCompleted || video.isLocked}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDrillClick(video);
                                }}
                              >
                                <p className="leading-tigh text-xs">Kerjakan Drill Soal</p>
                                <RiPencilFill className="w-10 h-10 ml-1" />
                              </Button>
                              
                              {/* Test completion button - remove in production */}
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-xs px-3 py-1 border-green-500 text-green-600 hover:bg-green-50 rounded-md"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  simulateDrillCompletion(video.id);
                                }}
                                disabled={!video.isCompleted || video.isLocked}
                              >
                                ✓ Test
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              size="sm" 
                              className="max-w-[100px] border-2 border-white text-xs p-2 bg-gradient-to-b from-[#223a67] to-[#2d69db] hover:bg-blue-600 text-white rounded-[5px] font-bold"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewScoreClick(video);
                              }}
                            >
                              <p>Lihat Hasil</p>
                              <HiOutlineDocumentReport className="w-4 h-4 ml-1" />
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
    </div>
  );
}