"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "~/app/_components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/app/_components/ui/card";
import TokenCard from "~/app/_components/token-card";
import { TbTargetArrow, TbBook, TbCoins } from "react-icons/tb";
import { useRouter } from "next/navigation";

interface PackageCardProps {
  title: string;
  description: string;
  price: number;
  features: string[];
  icon: React.ReactNode;
  onBuy: () => void;
}

const PackageCard = ({ title, description, price, features, icon, onBuy }: PackageCardProps) => {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow border-gray-200">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          {icon}
        </div>
        <CardTitle className="text-xl font-bold text-gray-900">{title}</CardTitle>
        <p className="text-gray-600 text-sm">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TbCoins className="w-6 h-6 text-orange-600" />
            <span className="text-3xl font-bold text-orange-600">{price}</span>
            <span className="text-gray-500">Token</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900">Fitur:</h4>
          <ul className="space-y-1">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-green-600 mt-0.5">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
        
        <Button 
          variant="default"
          onClick={onBuy}
          className="w-full"
        >
          Beli Paket
        </Button>
      </CardContent>
    </Card>
  );
};

export default function BeliPaketPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<{
    title: string;
    price: number;
  } | null>(null);

  const userTokens = 0;

  const handleBuyPackage = (packageTitle: string, price: number) => {
    setSelectedPackage({ title: packageTitle, price });
    setShowPurchaseDialog(true);
  };

  const handlePurchaseConfirm = () => {
    // Handle actual purchase logic here
    console.log('Purchase confirmed for:', selectedPackage);
    setShowPurchaseDialog(false);
    setSelectedPackage(null);
    // You might want to show a success message or redirect
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#e9e6ef] rounded-[10px] p-4">
        <div className="flex items-center gap-4">
          <TbCoins className="w-16 h-16 text-[#2b8057]" />
          <div>
            <h1 className="text-3xl font-bold text-[#2b8057]">Beli Paket</h1>
            <p className="text-gray-600 mt-1">
              Pilih paket yang sesuai dengan kebutuhan belajar Anda
            </p>
          </div>
        </div>
      </div>

      {/* Token Card */}
      <TokenCard tokenAmount={userTokens} />

      {/* Package Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* UTBK Package */}
        <PackageCard
          title="Paket UTBK"
          description="Persiapan lengkap untuk UTBK SNBT 2026"
          price={50}
          features={[
            "10+ Try Out UTBK terlengkap",
            "Pembahasan detail setiap soal",
            "Analisis skor dan ranking",
            "Latihan soal unlimited",
            "Video pembahasan materi",
            "Akses selama 6 bulan"
          ]}
          icon={<TbTargetArrow className="w-16 h-16 text-blue-600" />}
          onBuy={() => handleBuyPackage("Paket UTBK", 50)}
        />

        {/* TKA Package */}
        <PackageCard
          title="Paket TKA"
          description="Tes Kemampuan Akademik untuk berbagai jurusan"
          price={40}
          features={[
            "8+ Try Out TKA Saintek & Soshum",
            "Materi lengkap per mata pelajaran",
            "Bank soal ribuan pertanyaan",
            "Progress tracking detail",
            "Video pembelajaran",
            "Akses selama 6 bulan"
          ]}
          icon={<TbBook className="w-16 h-16 text-purple-600" />}
          onBuy={() => handleBuyPackage("Paket TKA", 40)}
        />
      </div>

      {/* Purchase Confirmation Dialog */}
      {showPurchaseDialog && selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Konfirmasi Pembelian</h3>
              <button 
                onClick={() => setShowPurchaseDialog(false)}
                className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-6">
              <h4 className="text-green-600 text-xl font-bold mb-2">
                {selectedPackage.title}
              </h4>
              <p className="text-gray-600 mb-4">
                Apakah Anda yakin ingin membeli paket ini?
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Harga:</span>
                  <div className="flex items-center gap-2">
                    <TbCoins className="w-5 h-5 text-orange-600" />
                    <span className="font-bold text-orange-600">{selectedPackage.price}</span>
                    <span className="text-gray-500">Token</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-gray-700">Token Anda:</span>
                  <div className="flex items-center gap-2">
                    <TbCoins className="w-5 h-5 text-orange-600" />
                    <span className="font-bold">{userTokens}</span>
                  </div>
                </div>
                <hr className="my-2" />
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Sisa Token:</span>
                  <div className="flex items-center gap-2">
                    <TbCoins className="w-5 h-5 text-orange-600" />
                    <span className="font-bold text-green-600">{userTokens - selectedPackage.price}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="default"
                onClick={handlePurchaseConfirm}
                className="flex-1"
                disabled={userTokens < selectedPackage.price}
              >
                {userTokens < selectedPackage.price ? 'Token Tidak Cukup' : 'Konfirmasi'}
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
