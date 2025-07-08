import { SubtestType } from "@prisma/client";
import { HiMiniVideoCamera } from "react-icons/hi2";
import { Button } from "~/app/_components/ui/button";
import ModulCard from "./modul-card";

const modules = [
  {
    title: "Modul Nerolusi",
    src: "/modul/nerolusi.webp",
  },
  {
    title: "Modul KPU",
    src: "/modul/kpu.webp",
  },
  {
    title: "Modul PBM",
    src: "/modul/pbm.webp",
  },
  {
    title: "Modul PPU",
    src: "/modul/ppu.png",
  },
  {
    title: "Modul PK",
    src: "/modul/pk.webp",
  },
  {
    title: "Modul PM",
    src: "/modul/pm.webp",
  },
  {
    title: "Modul LBING",
    src: "/modul/lbing.webp",
  },
  {
    title: "Modul LBIND",
    src: "/modul/lbind.webp",
  },
];

export default function RekamanPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="mt-4 flex items-center rounded-lg bg-gray-200 p-6">
        <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-[#2B8057]">
          <HiMiniVideoCamera className="size-10 text-white" />
        </div>
        <div className="ml-4 flex w-full flex-col justify-between gap-4">
          <h2 className="text-3xl font-bold text-[#2B8057]">
            Materi & Catatan
          </h2>
          <div className="flex w-full max-w-4xl flex-wrap justify-evenly gap-2">
            {Object.values(SubtestType).map((type) => (
              <Button key={type} className="flex-1 text-white">
                {type.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold text-green-600">Bahan Materi</h2>
        <p className="text-gray-700">
          Baca kembali catatan tutor dari liveclass yang sudah kamu ikuti!
        </p>
        <div className="mt-4 flex flex-wrap justify-around gap-4 lg:justify-start">
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
        <div className="mt-4 flex flex-wrap justify-around gap-4 lg:justify-start">
          {modules.slice(1).map((modul, idx) => (
            <ModulCard namaModul={modul.title} imageSrc={modul.src} key={idx} />
          ))}
        </div>
      </div>
    </div>
  );
}
