"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Video } from "lucide-react";
import HeadJenisSubtest from "~/app/_components/head-jenis-subtest";

export default function VideoHeader() {
  const router = useRouter();
  const pathname = usePathname();

  const [isMateri, setIsMateri] = useState(() => {
    return pathname === "/video/materi" || pathname.startsWith("/video/materi/");
  });

  useEffect(() => {
    setIsMateri(pathname === "/video/materi" || pathname.startsWith("/video/materi/"));
  }, [pathname]);

  const handleModeChange = (checked: boolean) => {
    setIsMateri(checked);
    if (checked) {
      router.push("/video/materi");
    } else {
      router.push("/video/rekaman");
    }
  };

  return (
    <div className="bg-[#e4e1ed] p-6 rounded-lg">
      <div className="flex flex-col md:flex-row items-center justify-center md:justify-between">
        <HeadJenisSubtest title="Video Materi Lengkap" type="rekaman" packageType="tka" />  {/* packageTypenya nanti diganti kl udh ada UTBK */}
        <div className="flex flex-col items-center border border-[#acaeba] rounded-[10px] bg-white mt-3 md:mt-0">
          <p className="text-xs text-black">Mode:</p>
          <div className="flex items-center bg-[#f2f2f2] rounded-[7px] border border-[#acaeba] relative">
            {/* Sliding background indicator */}
            <div 
              className={`absolute top-1 bottom-1 rounded-[7px] transition-all duration-300 ease-in-out ${
                isMateri ? 'bg-[radial-gradient(circle,#5dffb1,#29b270)]' : 'bg-[radial-gradient(circle,#bbdefb,#64b7fb)]'
              }`}
              style={{
                width: isMateri ? '70px' : '90px',
                transform: isMateri ? 'translateX(105px)' : 'translateX(5px)',
              }}
            />
            
            <button
              onClick={() => handleModeChange(false)}
              className={`relative z-10 px-5 py-2 rounded-[7px] text-sm font-bold transition-colors duration-300 ease-in-out ${
                !isMateri 
                  ? 'text-[#1800ad]' 
                  : 'text-[#b4b4b4] hover:text-gray-800'
              }`}
            >
              Rekaman
            </button>
            <button
              onClick={() => handleModeChange(true)}
              className={`relative z-10 px-5 py-2 rounded-[7px] text-sm font-bold transition-colors duration-300 ease-in-out ${
                isMateri 
                  ? 'text-[#2b8057]' 
                  : 'text-[#b4b4b4] hover:text-gray-800'
              }`}
            >
              Materi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}