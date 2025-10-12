import { SubtestType } from "@prisma/client";
import { HiMiniVideoCamera } from "react-icons/hi2";
import { Button } from "~/app/_components/ui/button";
import ModulCard from "./modul-card";
import HeadJenisSubtest from "~/app/_components/head-jenis-subtest";
import { getUTBKSubjects } from "~/app/_components/constants";
import SubjectCard from "~/app/_components/subject-card";

const isTka = false;

export default function ModulPage() {
  const modules = getUTBKSubjects();
  return (
    // redirect("/modul/materi"),
    <div className="flex flex-col gap-4">
      <HeadJenisSubtest title="Materi & Catatan" type="modul" isTka={isTka} />
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold text-green-600">Bahan Materi</h2>
        <p className="text-gray-700">
          Baca kembali catatan tutor dari liveclass yang sudah kamu ikuti!
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 min-[475px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8">
          {modules.map((modul, idx) => (
            // <ModulCard namaModul={modul.slug.toUpperCase()} imageSrc={modul.image} key={idx} />
            <SubjectCard
              key={idx}
              href={`/modul/materi/${modul.id}`}
              imageSrc={modul.image}
              title={modul.slug.toUpperCase()}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold text-green-600">Catatan Tutor</h2>
        <p className="text-gray-700">
          Baca kembali catatan tutor dari liveclass yang sudah kamu ikuti!
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 min-[475px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8">
          {modules.map((modul, idx) => (
            <SubjectCard
              key={idx}
              href={`/modul/catatan/${modul.id}`}
              imageSrc={modul.image}
              title={modul.slug.toUpperCase()}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
