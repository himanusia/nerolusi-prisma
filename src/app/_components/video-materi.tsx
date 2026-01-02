import { getSlugBySubjectName, SUBJECT_CATEGORIES } from "./constants";
import { Separator } from "~/app/_components/ui/separator";
import SubjectCard from "./subject-card";

interface VideoMateriProps {
  isTka: boolean;
}

export default function VideoMateri({ isTka }: VideoMateriProps) {
  return (
    <div className="flex flex-col items-start justify-start space-y-8">
      {SUBJECT_CATEGORIES.filter(
        (category) =>
          (isTka ? category.mode === "tka" : category.mode === "utbk") &&
          category.type !== "modul_nerolusi",
      ).map((category) => (
        <div key={category.type} className="w-full">
          <Separator className="mb-4 h-1 bg-gray-200" />

          <div className="flex flex-row gap-1 text-left text-sm font-bold md:gap-2 md:text-xl">
            <p>Video Materi</p>
            <p className="italic text-[#d78e0c]">
              from ZERO to Nero {category.type_name.toUpperCase()}
            </p>
          </div>
          <p className="mb-4 text-sm text-gray-600 md:text-lg">
            Video Pembelajaran Materi dan Quiz
          </p>

          {/* Subject Cards */}
          <div className="grid grid-cols-2 gap-4 min-[475px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8">
            {category.subjects.map((subject) => {
              const subjectTitle = isTka
                ? subject.title
                : getSlugBySubjectName(subject.title).toUpperCase();
              return (
                <SubjectCard
                  key={subject.id}
                  href={`/video/materi/${subject.slug}`}
                  imageSrc={subject.image}
                  title={subjectTitle}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
