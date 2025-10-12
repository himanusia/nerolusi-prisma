"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import HeadJenisSubtest from "~/app/_components/head-jenis-subtest";

export default function ModulHeader() {
  const router = useRouter();
  const pathname = usePathname();

  const [isMateri, setIsMateri] = useState(() => {
    return pathname === "/modul/tka";
  });

  useEffect(() => {
    setIsMateri(pathname === "/modul/tka");
  }, [pathname]);

  const handleModeChange = (checked: boolean) => {
    setIsMateri(checked);
    if (checked) {
      router.push("/modul/tka");
    } else {
      router.push("/modul");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg bg-[#e4e1ed] p-6">
        <HeadJenisSubtest title="Materi dan Catatan" type="modul" />
      </div>

      <div className="mt-3 flex max-w-[175px] flex-col items-center rounded-[10px] border border-[#acaeba] bg-white p-1 md:mt-0">
        <p className="text-xs text-black">Mode:</p>
        <div className="relative flex items-center rounded-[7px] border border-[#acaeba] bg-[#f2f2f2]">
          {/* Sliding background indicator */}
          <div
            className={`absolute bottom-1 top-1 rounded-[7px] transition-all duration-300 ease-in-out ${
              isMateri
                ? "bg-[radial-gradient(circle,#5dffb1,#29b270)]"
                : "bg-[radial-gradient(circle,#bbdefb,#64b7fb)]"
            }`}
            style={{
              width: isMateri ? "50px" : "70px",
              transform: isMateri ? "translateX(90px)" : "translateX(5px)",
            }}
          />
          <button
            onClick={() => handleModeChange(false)}
            className={`relative z-10 rounded-[7px] px-5 py-2 text-sm font-bold transition-colors duration-300 ease-in-out ${
              !isMateri
                ? "text-[#1800ad]"
                : "text-[#b4b4b4] hover:text-gray-800"
            }`}
          >
            UTBK
          </button>
          <button
            onClick={() => handleModeChange(true)}
            className={`relative z-10 rounded-[7px] px-5 py-2 text-sm font-bold transition-colors duration-300 ease-in-out ${
              isMateri ? "text-[#2b8057]" : "text-[#b4b4b4] hover:text-gray-800"
            }`}
          >
            TKA
          </button>
        </div>
      </div>
    </div>
  );
}
