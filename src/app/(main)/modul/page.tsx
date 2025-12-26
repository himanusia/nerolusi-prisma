import {
  getUTBKModulSubjects,
  getUTBKSubjects,
} from "~/app/_components/constants";
import HeadJenisSubtest from "~/app/_components/head-jenis-subtest";
import SubjectCard from "~/app/_components/subject-card";
import LoadingPage from "~/app/loading";

export default function ModulPage() {
  const moduleSubjects = getUTBKModulSubjects();
  const catatanSubjects = getUTBKSubjects();
  return (
    // redirect("/modul/materi"),
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <h2 className="text-xl font-bold">
          <span className="text-green-600">Belajar UTBK sekarang </span> dengan
          modul Nerolusi!
        </h2>
        <p className="text-sm text-gray-700">
          Yuk di baca-baca dan dipahamin modulnya sebagai fundamental belajar
          kamu!
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 min-[475px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8">
          {moduleSubjects.map((modul, idx) => (
            <SubjectCard
              key={idx}
              href={`/modul/materi/${modul.id}`}
              imageSrc={modul.image}
              title={`${modul.slug.toUpperCase().replaceAll("-", " ")}`}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col">
        <h2 className="text-xl font-bold">
          <span className="text-green-600">Recall ingatan kamu </span> dengan
          catatan tutor!
        </h2>
        <p className="text-sm text-gray-700">
          Kalo kamu mau belajar lagi tapi secara instan bisa langsung liat di
          catetan dari tutor!
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 min-[475px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8">
          {catatanSubjects.map((modul, idx) => (
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
