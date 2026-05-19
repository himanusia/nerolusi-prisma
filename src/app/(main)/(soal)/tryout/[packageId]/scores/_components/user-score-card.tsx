"use client";

import Image from "next/image";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/app/_components/ui/avatar";
import { Button } from "~/app/_components/ui/button";

interface UserScoreCardProps {
  userName: string;
  userImage: string | null;
  averageScore: number;
  isPackageEndDatePassed: boolean;
  onViewPembahasan: () => void;
  onDownloadCertificate: () => void;
  certificateDisabled: boolean;
}

export function UserScoreCard({
  userName,
  userImage,
  averageScore,
  isPackageEndDatePassed,
  onViewPembahasan,
  onDownloadCertificate,
  certificateDisabled,
}: UserScoreCardProps) {
  return (
    <div className="-mt-10 w-full md:w-1/3">
      <div className="-mt-5 flex items-center justify-center">
        <Image src="/logo2.png" alt="logo nerolusi" width={150} height={100} />
      </div>
      <div className="-mt-10 rounded-lg border bg-[#f2f2f2] px-10 py-6 shadow-sm">
        <div className="mb-4 text-center">
          <Avatar className="mx-auto mb-2 h-16 w-16 justify-center">
            <AvatarImage src={userImage || ""} />
            <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <h3 className="text-2xl font-bold text-gray-800">{userName}</h3>
          <p className="text-md font-bold text-black">-</p>
        </div>

        {/* Score Display */}
        <div className="mb-6 text-center">
          <div className="mb-1 text-5xl font-bold text-[#2b8057]">
            {isPackageEndDatePassed ? averageScore : "-"}
          </div>
          <p className="text-lg font-bold text-[#2b8057]">Skor rata-rata</p>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <Button
            variant="default"
            className="w-full"
            onClick={onViewPembahasan}
            disabled={!isPackageEndDatePassed}
          >
            Pembahasan
          </Button>
          <Button
            variant="default"
            className="w-full rounded-lg"
            onClick={onDownloadCertificate}
            disabled={certificateDisabled}
          >
            Unduh Sertifikat
          </Button>
        </div>
      </div>
    </div>
  );
}
