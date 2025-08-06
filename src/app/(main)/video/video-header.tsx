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
        {/* <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="w-16 h-16 bg-[#2b8057] rounded-full flex items-center justify-center">
            <Video className="w-8 h-8 text-white" />
          </div>
          <div className="flex flex-col items-center md:items-start">
            <h1 className="text-2xl font-bold text-[#2b8057] mb-2">Video Materi Lengkap</h1>
            <div className="flex gap-2 flex-wrap justify-center md:justify-start">
              <span className="bg-[#2b8057] text-white px-3 py-1 rounded text-sm font-medium">PU</span>
              <span className="bg-[#2b8057] text-white px-3 py-1 rounded text-sm font-medium">PBM</span>
              <span className="bg-[#2b8057] text-white px-3 py-1 rounded text-sm font-medium">PPU</span>
              <span className="bg-[#2b8057] text-white px-3 py-1 rounded text-sm font-medium">PM</span>
              <span className="bg-[#2b8057] text-white px-3 py-1 rounded text-sm font-medium">PK</span>
              <span className="bg-[#2b8057] text-white px-3 py-1 rounded text-sm font-medium">LBING</span>
              <span className="bg-[#2b8057] text-white px-3 py-1 rounded text-sm font-medium">LBIND</span>
            </div>
          </div>
        </div> */}
        <HeadJenisSubtest title="Video Materi Lengkap" type="rekaman" />
        
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