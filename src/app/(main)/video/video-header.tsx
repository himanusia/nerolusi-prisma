"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import HeadJenisSubtest from "~/app/_components/head-jenis-subtest";
import { useMode } from "~/contexts/mode-context";

export default function VideoHeader() {
  const router = useRouter();
  const pathname = usePathname();

  const { mode } = useMode();

  const [isMateri, setIsMateri] = useState(() => {
    return (
      pathname === `/video/${mode}/materi` ||
      pathname.startsWith(`/video/${mode}/materi/`)
    );
  });

  const [showToggle, setShowToggle] = useState(() => {
    return (
      pathname === `/video/${mode}/materi` ||
      pathname.startsWith(`/video/${mode}/materi/`) ||
      pathname === `/video/${mode}/umum` ||
      pathname.startsWith(`/video/${mode}/umum/`)
    );
  });

  useEffect(() => {
    setIsMateri(
      pathname === `/video/${mode}/materi` ||
        pathname.startsWith(`/video/${mode}/materi/`),
    );
    setShowToggle(
      pathname === `/video/${mode}/materi` ||
        pathname.startsWith(`/video/${mode}/materi/`) ||
        pathname === `/video/${mode}/umum` ||
        pathname.startsWith(`/video/${mode}/umum/`),
    );
  }, [pathname]);

  const handleModeChange = (checked: boolean) => {
    setIsMateri(checked);
    if (checked) {
      router.push(`/video/${mode}/materi`);
    } else {
      router.push(`/video/${mode}/umum`);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg bg-[#e4e1ed] p-6">
        <HeadJenisSubtest title="Video Materi Lengkap" type="rekaman" />
      </div>
      {showToggle && (
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
                width: isMateri ? "70px" : "75px",
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
              Umum
            </button>
            <button
              onClick={() => handleModeChange(true)}
              className={`relative z-10 rounded-[7px] px-5 py-2 text-sm font-bold transition-colors duration-300 ease-in-out ${
                isMateri
                  ? "text-[#2b8057]"
                  : "text-[#b4b4b4] hover:text-gray-800"
              }`}
            >
              Materi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
