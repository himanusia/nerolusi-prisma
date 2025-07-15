import { SubtestType } from "@prisma/client";
import { HiMiniVideoCamera } from "react-icons/hi2";
import { Button } from "~/app/_components/ui/button";
import ModulCard from "./modul-card";
import HeadJenisSubtest from "~/app/_components/head-jenis-subtest";

const modules = [
  {
    title: "Nerolusi",
    src: "/modul/nerolusi.webp",
  },
  {
    title: "KPU",
    src: "/modul/kpu.webp",
  },
  {
    title: "PBM",
    src: "/modul/pbm.webp",
  },
  {
    title: "PPU",
    src: "/modul/ppu.png",
  },
  {
    title: "PK",
    src: "/modul/pk.webp",
  },
  {
    title: "PM",
    src: "/modul/pm.webp",
  },
  {
    title: "LBING",
    src: "/modul/lbing.webp",
  },
  {
    title: "LBIND",
    src: "/modul/lbind.webp",
  },
];

export default function ModulPage() {
  return (
    <div className="flex flex-col gap-4">
      <HeadJenisSubtest title="Materi & Catatan" type="modul" />
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold text-green-600">Bahan Materi</h2>
        <p className="text-gray-700">
          Baca kembali catatan tutor dari liveclass yang sudah kamu ikuti!
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 min-[475px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8">
          {modules.map((modul, idx) => (
            <ModulCard namaModul={modul.title} imageSrc={modul.src} key={idx} />
          ))}
        </div>
      </div>
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold text-green-600">Catatan Tutor</h2>
        <p className="text-gray-700">
          Baca kembali catatan tutor dari liveclass yang sudah kamu ikuti!
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 min-[475px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8">
          {modules.slice(1).map((modul, idx) => (
            <ModulCard namaModul={modul.title} imageSrc={modul.src} key={idx} />
          ))}
        </div>
      </div>
    </div>
  );
}
