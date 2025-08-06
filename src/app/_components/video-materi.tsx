"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { SUBJECT_CATEGORIES, type Subject } from "./constants";
import { Separator } from "~/app/_components/ui/separator";

export default function VideoMateri() {
    const router = useRouter();

    const handleSubjectClick = (subject: Subject) => {
        router.push(`/video/materi/${subject.slug}`);
    };

    return (
        <div className="flex flex-col items-start justify-start space-y-8">
            {SUBJECT_CATEGORIES.map((category) => (
                <div key={category.type} className="w-full">
                    <Separator className="h-1 bg-gray-200 mb-4" />

                    <div className="flex flex-row font-bold text-xl gap-2">
                        <p>Video Materi</p>
                        <p className="text-[#d78e0c] italic">
                            from ZERO to Nero {category.type.toUpperCase()}
                        </p>
                    </div>
                    <p className="text-gray-600 mb-4">Video Pembelajaran Materi dan Quiz</p>
                    
                    {/* Subject Cards */}
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                        {category.subjects.map((subject) => (
                            <div
                                key={subject.id}
                                onClick={() => handleSubjectClick(subject)}
                                className="max-w-[150px] min-w-[150px] flex flex-col items-center justify-center p-3 border border-[#2b8057] rounded-[10px] bg-white hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
                            >
                                <div className="w-16 h-16 bg-[#2b8057] rounded-[9px] flex items-center justify-center shadow-sm mb-2">
                                    <Image
                                        src={subject.image}
                                        alt={subject.title}
                                        width={40}
                                        height={40}
                                        className="object-cover"
                                    />
                                </div>
                                <h3 className="text-sm font-medium text-[#545454] text-center leading-tight">
                                    {subject.title}
                                </h3>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}