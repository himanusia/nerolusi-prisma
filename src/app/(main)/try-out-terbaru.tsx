"use client";

import { Button } from "../_components/ui/button";
import { Card, CardContent } from "../_components/ui/card";
import { Badge } from "../_components/ui/badge";
import { CalendarIcon, ChevronRight } from "lucide-react";

// Dummy data for try-out tests
const dummyTryOuts = [
  {
    id: 1,
    title: "Try Out UTBK SNBT 2026",
    subtitle: "Try Out #1",
    dateRange: "23 November - 30 November 2025",
    status: "available",
    number: "1",
    participants: 1250,
    difficulty: "medium",
    token: 1,
  },
  {
    id: 2,
    title: "Try Out UTBK SNBT 2026",
    subtitle: "Try Out #2",
    dateRange: "1 Desember - 7 Desember 2025",
    status: "upcoming",
    number: "2",
    participants: 850,
    difficulty: "hard",
    token: 1,
  },
  {
    id: 3,
    title: "Try Out UTBK SNBT 2026",
    subtitle: "Try Out #3",
    dateRange: "10 Desember - 17 Desember 2025",
    status: "upcoming",
    number: "3",
    participants: 0,
    difficulty: "medium",
    token: 2,
  },
];

export default function TryOutTerbaru() {
  const getStatusInfo = (status: string) => {
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
        };
      case "upcoming":
        return {
          badge: {
            label: "Segera",
            className: "bg-blue-100 text-blue-800 border-blue-200",
          },
          button: {
            label: "Daftar",
            disabled: false,
            className: "bg-blue-600 hover:bg-blue-700",
          },
        };
      case "finished":
        return {
          badge: {
            label: "Selesai",
            className: "bg-gray-100 text-gray-600 border-gray-200",
          },
          button: {
            label: "Lihat Hasil",
            disabled: false,
            className: "bg-gray-600 hover:bg-gray-700",
          },
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
        };
    }
  };

  return (
    <div className="space-y-4 overflow-auto">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Try Out Tersedia</h3>
          <p className="text-gray-600">
            Kerjakan Try Out mu untuk melihat hasil belajarmu!
          </p>
        </div>
        <Button variant="outline" size="sm">
          Lihat semua <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-2 w-full overflow-x-scroll scrollbar-thin scrollbar-track-transparent pb-2">
        {dummyTryOuts.map((tryOut) => {
          const statusInfo = getStatusInfo(tryOut.status);

          return (
            <Card
              key={tryOut.id}
              className="w-96 overflow-hidden border-gray-300 shrink-0"
            >
              <CardContent className="p-0">
                <div className="flex">
                  {/* Left section with number */}
                  <div className="flex w-20 flex-col items-center justify-center border-r border-gray-300 bg-green-600 pt-2 text-white">
                    <div className="text-xs font-medium">Try Out</div>
                    <div className="mt-1 text-xs">SNBT</div>
                    <div className="mt-2 flex w-full flex-1 items-center justify-center bg-white text-center text-3xl font-bold text-black">
                      {tryOut.number}
                    </div>
                  </div>

                  {/* Main content */}
                  <div className="flex flex-1 items-center justify-between p-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-semibold text-green-700">
                          {tryOut.title}
                        </h4>
                      </div>
                      <p className="mb-4 text-sm font-medium text-gray-900">
                        {tryOut.subtitle}
                      </p>

                      <div className="flex items-center justify-between gap-2 text-sm text-gray-600">
                        <div className="flex gap-2 items-center">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{tryOut.dateRange}</span>
                        </div>
                        <div className="flex h-full items-end justify-end px-2 text-lg font-bold">
                          <img src="/home/coin.webp" alt="Coin" className="size-6" />
                          <span className="ml-2 flex h-6 items-center justify-center">
                            {tryOut.token}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right section*/}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {dummyTryOuts.length === 0 && (
        <div className="py-8 text-center text-muted-foreground">
          Tidak ada try out yang tersedia saat ini
        </div>
      )}
    </div>
  );
}
