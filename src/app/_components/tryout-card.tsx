"use client";

import { Card, CardContent } from "~/app/_components/ui/card";
import { CalendarIcon, ChevronRight } from "lucide-react";
import { ImArrowRight } from "react-icons/im";
import Image from "next/image";

export interface TryOutData {
  id: number;
  title: string;
  subtitle: string;
  dateRange: string;
  status: "available" | "upcoming" | "finished" | "ongoing";
  number: string;
  participants: number;
  difficulty: "easy" | "medium" | "hard";
  token?: number;
}

interface TryOutCardProps {
  tryOut: TryOutData;
  onTryOutClick?: (tryOut: TryOutData) => void;
}

export default function TryOutCard({ tryOut, onTryOutClick }: TryOutCardProps) {
  const getStatusInfo = (status: TryOutData["status"]) => {
    switch (status) {
      case "available":
        return {
          badge: {
            label: "Tersedia",
            className: "bg-green-100 text-green-800 border-green-200",
          },
          button: {
            label: "Mulai",
            disabled: false,
            className: "bg-green-600 hover:bg-green-700",
          },
          showArrow: true,
          showCoin: false,
          cardClassName: "",
        };
      case "upcoming":
        return {
          badge: {
            label: "Segera",
            className: "bg-blue-100 text-blue-800",
          },
          button: {
            label: "Daftar",
            disabled: false,
            className: "bg-blue-600 hover:bg-blue-700",
          },
          showArrow: false,
          showCoin: true,
          cardClassName: "",
        };
      case "finished":
        return {
          badge: {
            label: "Selesai",
            className: "bg-green-100 text-green-800 border-green-200",
          },
          button: {
            label: "Lihat Hasil",
            disabled: false,
            className: "bg-green-600 hover:bg-green-700",
          },
          showArrow: false,
          showCoin: false,
          cardClassName: "bg-gradient-to-r from-[#9ad09f] to-[#cbffd0]",
        };
      case "ongoing":
        return {
          badge: {
            label: "Berlangsung",
            className: "bg-orange-100 text-orange-800 border-orange-200",
          },
          button: {
            label: "Lanjutkan",
            disabled: false,
            className: "bg-orange-600 hover:bg-orange-700",
          },
          showArrow: true,
          showCoin: false,
          cardClassName: "",
        };
      default:
        return {
          badge: {
            label: "Tidak Tersedia",
            className: "bg-gray-100 text-gray-600 border-gray-200",
          },
          button: {
            label: "Tidak Tersedia",
            disabled: true,
            className: "bg-gray-400",
          },
          showArrow: false,
          showCoin: false,
          cardClassName: "",
        };
    }
  };

  const statusInfo = getStatusInfo(tryOut.status);

  return (
    <Card
      className={`w-96 overflow-hidden border-[#acaeba] shrink-0 cursor-pointer hover:shadow-lg transition-shadow ${statusInfo.cardClassName}`}
      onClick={() => onTryOutClick?.(tryOut)}
    >
      <CardContent className="p-0">
        <div className="flex flex-row max-h-full items-start">
          <div className={`flex flex-col text-white items-center justify-between`}>
            <div className="h-1/2 flex flex-col items-center justify-center bg-[#2b8057] p-3 border-r border-[#acaeba]">
              <div className="text-xs font-bold">Try Out</div>
              <div className="mt-1 text-xs font-bold">SNBT</div>
            </div>
            <div className={`flex flex-1/2 w-full items-center justify-center bg-tranparent text-center text-3xl font-bold text-black py-2 border-r border-[#acaeba]`}>
              {tryOut.number}
            </div>
          </div>

          <div className="flex flex-col items-center justify-between p-2">
            <div className="flex-1">
              {/* <div className="flex items-center mb-2">
                {tryOut.status === 'finished' && (
                  <span className="bg-green-100 text-green-800 border border-green-200 px-2 py-1 rounded-full text-xs font-medium">
                    Selesai
                  </span>
                )}
                {tryOut.status === 'ongoing' && (
                  <span className="bg-orange-100 text-orange-800 border border-orange-200 px-2 py-1 rounded-full text-xs font-medium">
                    Berlangsung
                  </span>
                )}
              </div> */}
              
              <h4 className="text-lg font-bold text-gray-900 mb-1">
                {tryOut.title}
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                {tryOut.subtitle}
              </p>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CalendarIcon className="h-4 w-4" />
                <span>{tryOut.dateRange}</span>
                <div className="flex items-end gap-3 ">
                  {statusInfo.showCoin && tryOut.token && (
                    <div className="flex items-center gap-1 text-black px-3 py-1 rounded-full">
                      <Image
                        src="/coin.webp"
                        alt="Coin"
                        width={16}
                        height={16}
                        className="inline-block mr-1"
                      />
                      <span className="font-bold text-lg">{tryOut.token}</span>
                    </div>
                  )}
                  
                  {statusInfo.showArrow && (
                    // <div className="flex justify-end">
                      <ImArrowRight className="w-6 h-6 text-[#2b8057]" />
                    // </div>
                  )}
                </div>
              </div>
            </div>

            
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
