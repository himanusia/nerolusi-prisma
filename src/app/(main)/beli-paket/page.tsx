"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "~/app/_components/ui/button";

import TokenCard from "~/app/_components/token-card";
import { TbTargetArrow, TbBook, TbCoins } from "react-icons/tb";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "~/trpc/react";
import { PackageCard } from "./package-card";
import { toast } from "sonner";
import LoadingPage from "~/app/loading";

export default function BeliPaketPage() {
  const { data: session, status } = useSession();
  // const router = useRouter();
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<{
    title: "Paket TKA" | "Paket UTBK";
    price: number;
  } | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const createPayment = api.payment.createCheckout.useMutation({
    onSuccess: (dokuUrl) => {
      // Direct redirect to DOKU's hosted checkout page
      window.location.href = dokuUrl;
    },
    onError: (error) => {
      setIsRedirecting(false);
      toast.error(`Gagal melakukan checkout: ${error.message}`);
    },
  });

  const handleBuyPackage = (
    packageTitle: "Paket TKA" | "Paket UTBK",
    price: number,
  ) => {
    setSelectedPackage({ title: packageTitle, price });
    setShowPurchaseDialog(true);
  };

  const handlePurchaseConfirm = () => {
    setShowPurchaseDialog(false);
    setSelectedPackage(null);

    setIsRedirecting(true);
    
    const idempotencyKey = crypto.randomUUID();
    const type = selectedPackage?.title === "Paket TKA" ? "tka" : "utbk";

    createPayment.mutate({ idempotencyKey, type, userId: session?.user.id, amount: selectedPackage.price});
  };

  if (status === "loading") {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[10px] bg-[#e9e6ef] p-4">
        <div className="flex items-center gap-4">
          <TbCoins className="h-16 w-16 text-[#2b8057]" />
          <div>
            <h1 className="text-3xl font-bold text-[#2b8057]">Beli Paket</h1>
            <p className="mt-1 text-gray-600">
              Pilih paket yang sesuai dengan kebutuhan belajar Anda
            </p>
          </div>
        </div>
      </div>

      {/* Token Card */}
      {/* <TokenCard tokenAmount={userTokens} /> */}

      {/* Package Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* UTBK Package */}
        <PackageCard
          title="Paket UTBK"
          description="Persiapan lengkap untuk UTBK SNBT 2026"
          price="Rp379.000,00"
          features={[
            "10+ Try Out UTBK terlengkap",
            "Pembahasan detail setiap soal",
            "Analisis skor dan ranking",
            "Latihan soal unlimited",
            "Video pembahasan materi",
          ]}
          icon={<TbTargetArrow className="h-16 w-16 text-blue-600" />}
          href={"/"}
          onClick={() => handleBuyPackage("Paket UTBK", 379000)}
          disabled={isRedirecting}
        />

        {/* TKA Package */}
        <PackageCard
          title="Paket TKA"
          description="Tes Kemampuan Akademik untuk berbagai jurusan"
          price="Rp49.000,00"
          features={[
            "Try Out TKA Saintek & Soshum",
            "Materi lengkap per mata pelajaran",
            "Bank soal dengan berbagai pertanyaan",
            "Progress tracking detail",
            "Video pembelajaran",
          ]}
          icon={<TbBook className="h-16 w-16 text-purple-600" />}
          href={"https://bit.ly/Nerolusi-INTI-TKA2025"}
          disabled={isRedirecting}
          onClick={() => handleBuyPackage("Paket TKA", 49000)}
        />
      </div>

      {/* Purchase Confirmation Dialog */}
      {showPurchaseDialog && selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Konfirmasi Pembelian</h3>
              <button
                onClick={() => setShowPurchaseDialog(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <h4 className="mb-2 text-xl font-bold text-green-600">
                {selectedPackage.title}
              </h4>
              <p className="mb-4 text-gray-600">
                Apakah Anda yakin ingin membeli paket ini?
              </p>
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Harga:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-orange-600">
                      {selectedPackage.price}
                    </span>
                  </div>
                </div>
                <hr className="my-2" />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="default"
                onClick={handlePurchaseConfirm}
                className="flex-1"
              >
                Konfirmasi
              </Button>
              <Button
                onClick={() => setShowPurchaseDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
