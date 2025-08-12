import { SubtestType } from "@prisma/client";
import { HiMiniVideoCamera } from "react-icons/hi2";
import { Button } from "~/app/_components/ui/button";
import DaftarRekaman from "./daftar-rekaman";
import HeadJenisSubtest from "~/app/_components/head-jenis-subtest";

export default function RekamanPage() {
  return (
    <div className="flex flex-col gap-4">
      {/* <HeadJenisSubtest title="Rekaman Live Class" type="rekaman" /> */}
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold text-green-600">Daftar Rekaman</h2>
        <p className="text-gray-700">Tonton ulang videonya agar kamu lebih paham!</p>
      </div>
      <DaftarRekaman />
    </div>
  );
}
