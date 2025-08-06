"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Play, CheckCircle, Edit3, Lock } from "lucide-react";
import { Button } from "~/app/_components/ui/button";
import { getSubjectBySlug, type Subject } from "~/app/_components/constants";

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
  const subject = getSubjectBySlug(params.subject as string);

  const [sections, setSections] = useState<MaterialSection[]>([
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
        },
        {
          id: 4,
          title: "Konsep aljabar",
          duration: "5 minutes",
          isCompleted: false,
          isLocked: true,
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
        },
        {
          id: 6,
          title: "Program Linear",
          duration: "21 minutes",
          isCompleted: false,
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
        },
        {
          id: 8,
          title: "Operasi Himpunan",
          duration: "12 minutes",
          isCompleted: false,
        },
        {
          id: 9,
          title: "Fungsi Linear",
          duration: "11 minutes",
          isCompleted: false,
        },
        {
          id: 10,
          title: "Fungsi Kuadrat",
          duration: "10 minutes",
          isCompleted: false,
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
        },
        {
          id: 12,
          title: "Menyelesaikan Persamaan Kuadrat",
          duration: "15 minutes",
          isCompleted: false,
        },
        {
          id: 13,
          title: "Diskriminan",
          duration: "8 minutes",
          isCompleted: false,
        },
        {
          id: 14,
          title: "Fungsi Kuadrat",
          duration: "18 minutes",
          isCompleted: false,
        },
        {
          id: 15,
          title: "Grafik Fungsi Kuadrat",
          duration: "12 minutes",
          isCompleted: false,
        },
        {
          id: 16,
          title: "Aplikasi Fungsi Kuadrat",
          duration: "16 minutes",
          isCompleted: false,
        },
      ],
    },
  ]);

  const toggleSection = (sectionId: number) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, isExpanded: !section.isExpanded }
        : section
    ));
  };

  const toggleVideoCompleted = (videoId: number) => {
    setSections(sections.map(section => ({
      ...section,
      videos: section.videos.map(video => 
        video.id === videoId 
          ? { ...video, isCompleted: !video.isCompleted }
          : video
      )
    })));
  };

  const handleVideoClick = (video: Video) => {
    if (video.isLocked) return;
    console.log(`Playing video: ${video.title}`);
    // Handle video play logic
  };

  const handleDrillClick = (video: Video) => {
    if (!video.isCompleted || video.isLocked) return;
    
    if (video.isDrillCompleted) {
      // Navigate to scores page - you can adjust this path as needed
      router.push(`/drill/${params.subject}/scores/${video.id}`);
    } else {
      // Navigate to drill page using [drill]/[subtest] structure
      // Using 'soal' as drill type and the subject as subtest
      router.push(`/soal/drill/${params.subject}`);
    }
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
      {/* Subject Header */}
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
        <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Section Header */}
          <div 
            className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => toggleSection(section.id)}
          >
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                Materi {section.id} - {section.title.replace(`Materi ${section.id} - `, '')}
              </h3>
              {section.subtitle && (
                <p className="text-sm text-gray-600 mt-1">{section.subtitle}</p>
              )}
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{section.videoCount} Videos</span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Total durasi: {section.totalDuration}</span>
              </div>
              {section.isExpanded ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>

          {/* Videos List */}
          {section.isExpanded && (
            <div className="bg-white">
              {section.videos.map((video) => (
                <div 
                  key={video.id} 
                  className={`flex items-center justify-between p-4 border-t border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                    video.isLocked ? 'opacity-60' : ''
                  } ${
                    video.isCompleted ? 'bg-green-100' : 'bg-white'
                  }`}
                  onClick={() => handleVideoClick(video)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      video.isCompleted ? 'bg-[#2b8057]' : 'bg-gray-600'
                    }`}>
                      <Play className="w-4 h-4 text-white fill-white" />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{video.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span>---- {video.duration}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Checkbox for completion status */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={video.isCompleted}
                        onChange={() => toggleVideoCompleted(video.id)}
                        disabled={video.isLocked}
                        className="w-4 h-4 rounded border-gray-300 text-[#2b8057] focus:ring-[#2b8057] disabled:opacity-50"
                      />
                      <span className="text-xs text-gray-600 font-medium">
                        Sudah ditonton:
                      </span>
                    </div>
                    
                    {/* Quiz/Drill Button */}
                    {video.hasQuiz && (
                      <Button 
                        size="sm" 
                        className={`text-xs px-3 ${
                          !video.isCompleted || video.isLocked 
                            ? 'bg-gray-400 cursor-not-allowed hover:bg-gray-400' 
                            : video.isDrillCompleted 
                              ? 'bg-blue-500 hover:bg-blue-600' 
                              : 'bg-orange-500 hover:bg-orange-600'
                        } text-white`}
                        disabled={!video.isCompleted || video.isLocked}
                        onClick={() => handleDrillClick(video)}
                      >
                        <Edit3 className="w-3 h-3 mr-1" />
                        {video.isDrillCompleted ? 'Lihat Hasil 📊' : 'Kerjakan Drill Soal'}
                      </Button>
                    )}
                    
                    {video.isLocked && (
                      <div className="flex items-center gap-2 opacity-60">
                        <Lock className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-500">🔒</span>
                      </div>
                    )}
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