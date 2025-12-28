import { SUBJECT_CATEGORIES } from "./constants";
import { Separator } from "~/app/_components/ui/separator";
import SubjectCard from "./subject-card";

export default function VideoMateri() {
  return (
    <div className="flex flex-col items-start justify-start space-y-8">
      {SUBJECT_CATEGORIES.filter((category) => category.type !== "utbk" && category.type !== "modul_nerolusi").map(
        (category) => (
          <div key={category.type} className="w-full">
            <Separator className="mb-4 h-1 bg-gray-200" />

            <div className="flex flex-row gap-1 text-left text-sm font-bold md:gap-2 md:text-xl">
              <p>Video Materi</p>
              <p className="italic text-[#d78e0c]">
                from ZERO to Nero {category.type.toUpperCase()}
              </p>
            </div>
            <p className="mb-4 text-sm text-gray-600 md:text-lg">
              Video Pembelajaran Materi dan Quiz
            </p>

            {/* Subject Cards */}
            <div className="flex flex-wrap justify-start gap-4">
              {category.subjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  href={`/video/materi/${subject.slug}`}
                  imageSrc={subject.image}
                  title={subject.title}
                />
              ))}
            </div>
          </div>
        ),
      )}
    </div>
  );
}
