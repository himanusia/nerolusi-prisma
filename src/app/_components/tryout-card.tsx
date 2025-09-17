"use client";

import { Card, CardContent } from "~/app/_components/ui/card";
import { Button } from "~/app/_components/ui/button";
import { CalendarIcon, ChevronRight } from "lucide-react";
import { ImArrowRight } from "react-icons/im";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

export interface TryOutData {
  id: string;
  title: string;
  subtitle: string;
  dateRange: string;
  status: "available" | "upcoming" | "unpurchased" | "completed";
  isEnded: boolean;
  number: string;
  participants: number;
  difficulty: "easy" | "medium" | "hard";
  token?: number;
  tokenPrice?: number; // Add tokenPrice for purchase dialog
}

interface TryOutCardProps {
  tryOut: TryOutData;
  onTryOutClick?: (tryOut: TryOutData) => void;
  onPurchase?: (tryOutId: string) => Promise<void>; // Add purchase callback
}

export default function TryOutCard({
  tryOut,
  onTryOutClick,
  onPurchase,
}: TryOutCardProps) {
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCardClick = () => {
    if (tryOut.status === "unpurchased" && tryOut.tokenPrice && onPurchase) {
      // Show purchase dialog for unpurchased packages
      setShowPurchaseDialog(true);
    } else {
      // For all other statuses, use the regular click handler
      onTryOutClick?.(tryOut);
    }
  };

  const handlePurchase = async () => {
    if (!onPurchase) return;

    setIsLoading(true);
    try {
      await onPurchase(tryOut.id);
      setShowPurchaseDialog(false);
      toast.success("Purchase successful!");
    } catch (error) {
      toast.error(
        "Purchase failed: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    } finally {
      setIsLoading(false);
    }
  };
  const getStatusInfo = (status: TryOutData["status"]) => {
    switch (status) {
      case "available":
        return {
          showArrow: true,
          showCoin: false,
          cardClassName: "",
        };
      case "upcoming":
        return {
          showArrow: false,
          showCoin: false,
          cardClassName:
            "bg-gradient-to-r from-gray-200 to-gray-300 opacity-75",
        };
      case "completed":
        return {
          showArrow: false,
          showCoin: false,
          cardClassName: "bg-gradient-to-r from-[#9ad09f] to-[#cbffd0]",
        };
      case "unpurchased":
        return {
          showArrow: false,
          showCoin: true,
          cardClassName: "",
        };
      default:
        return {
          showArrow: false,
          showCoin: false,
          cardClassName: "",
        };
    }
  };

  const statusInfo = getStatusInfo(tryOut.status);

  return (
    <>
      <Card
        className={`min-w-72 max-w-96 shrink-0 cursor-pointer overflow-hidden border-[#acaeba] transition-shadow hover:shadow-lg ${statusInfo.cardClassName}`}
        onClick={handleCardClick}
      >
        <CardContent className="p-0">
          <div className="flex max-h-full flex-row items-start">
            <div
              className={`flex flex-col items-center justify-between text-white`}
            >
              <div className="flex h-1/2 flex-col items-center justify-center border-r border-[#acaeba] bg-[#2b8057] p-3">
                <div className="text-xs font-bold">Try Out</div>
                <div className="mt-1 text-xs font-bold">TKA</div>
              </div>
              <div
                className={`flex-1/2 flex w-full items-center justify-center border-r border-[#acaeba] bg-transparent py-2 text-center text-3xl font-bold text-black`}
              >
                {tryOut.number}
              </div>
            </div>

            <div className="flex flex-col items-center justify-between p-2">
              <div className="flex-1">
                <h4 className="mb-1 text-lg font-bold text-gray-900">
                  {tryOut.title}
                </h4>
                <p className="mb-2 text-sm text-gray-600">{tryOut.subtitle}</p>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {!tryOut.isEnded && (
                    <div>
                      <CalendarIcon className="h-4 w-4" />
                      <span>{tryOut.dateRange}</span>
                    </div>
                  )}
                  <div className="flex items-end gap-3">
                    {statusInfo.showCoin &&
                      tryOut.tokenPrice !== undefined &&
                      tryOut.tokenPrice !== null && (
                        <div className="flex items-center gap-1 rounded-full px-3 py-1 text-black">
                          <Image
                            src="/coin.webp"
                            alt="Coin"
                            width={16}
                            height={16}
                            className="mr-1 inline-block"
                          />
                          <span className="text-lg font-bold">
                            {tryOut.tokenPrice}
                          </span>
                        </div>
                      )}

                    {statusInfo.showArrow && (
                      <ImArrowRight className="h-6 w-6 text-[#2b8057]" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Dialog */}
      {showPurchaseDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Pembelian TO</h3>
              <button
                onClick={() => setShowPurchaseDialog(false)}
                className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#ff3d00] font-bold text-white hover:bg-red-600"
                disabled={isLoading}
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <h4 className="mb-2 text-xl font-bold text-[#2b8057]">
                Apakah anda yakin untuk membeli TO ini?
              </h4>
              <p className="text-gray-600">
                Apabila pembelian TO sudah dilakukan, anda tidak akan bisa
                mengembalikan koin anda kembali! apakah yakin untuk melanjutkan
                pembelian?
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handlePurchase}
                className="flex-1 font-bold text-[#2b8057]"
                disabled={isLoading}
              >
                <Image
                  src="/coin.webp"
                  alt="Coin"
                  className="mr-2 h-5 w-5"
                  width={20}
                  height={20}
                />
                {isLoading
                  ? "Membeli..."
                  : `Ya ${tryOut.tokenPrice ?? tryOut.tokenPrice ?? 1}`}
              </Button>
              <Button
                onClick={() => setShowPurchaseDialog(false)}
                variant="outline"
                className="flex-1"
                disabled={isLoading}
              >
                Tidak
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
