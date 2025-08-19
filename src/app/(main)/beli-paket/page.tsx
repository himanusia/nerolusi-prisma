"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "~/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/app/_components/ui/card";
import TokenCard from "~/app/_components/token-card";
import { TbTargetArrow, TbBook, TbCoins } from "react-icons/tb";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PackageCardProps {
  title: string;
  description: string;
  price: string;
  features: string[];
  icon: React.ReactNode;
  disabled: boolean;
  href: string;
}

const PackageCard = ({
  title,
  description,
  price,
  features,
  icon,
  disabled,
  href,
}: PackageCardProps) => {
  return (
    <Card className="h-full border-gray-200 transition-shadow hover:shadow-lg">
      <CardHeader className="pb-4 text-center">
        <div className="mb-4 flex justify-center">{icon}</div>
        <CardTitle className="text-xl font-bold text-gray-900">
          {title}
        </CardTitle>
        <p className="text-sm text-gray-600">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4 flex flex-col">
        <div className="text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <span className="text-3xl font-bold text-orange-600">{price}</span>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900">Fitur:</h4>
          <ul className="space-y-1">
            {features.map((feature, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-gray-600"
              >
                <span className="mt-0.5 text-green-600">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <Link href={href} target="_blank">
          <Button variant="default" className="w-full" disabled={disabled}>
            Beli Paket
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default function BeliPaketPage() {
  // const { data: session } = useSession();
  // const router = useRouter();
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<{
    title: string;
    price: number;
  } | null>(null);

  const userTokens = 0;

  // const handleBuyPackage = (packageTitle: string, price: number) => {
  //   // setSelectedPackage({ title: packageTitle, price });
  //   // setShowPurchaseDialog(true);
  //   router.push("");
  // };

  // const handlePurchaseConfirm = () => {
  //   // Handle actual purchase logic here
  //   console.log("Purchase confirmed for:", selectedPackage);
  //   setShowPurchaseDialog(false);
  //   setSelectedPackage(null);
  //   // You might want to show a success message or redirect
  // };

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
          price={"Coming Soon"}
          features={[
            "10+ Try Out UTBK terlengkap",
            "Pembahasan detail setiap soal",
            "Analisis skor dan ranking",
            "Latihan soal unlimited",
            "Video pembahasan materi",
          ]}
          icon={<TbTargetArrow className="h-16 w-16 text-blue-600" />}
          href={"/"}
          disabled={true}
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
          disabled={false}
        />
      </div>

      {/* Purchase Confirmation Dialog */}
      {/* {showPurchaseDialog && selectedPackage && (
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
                    <TbCoins className="h-5 w-5 text-orange-600" />
                    <span className="font-bold text-orange-600">
                      {selectedPackage.price}
                    </span>
                    <span className="text-gray-500">Token</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-gray-700">Token Anda:</span>
                  <div className="flex items-center gap-2">
                    <TbCoins className="h-5 w-5 text-orange-600" />
                    <span className="font-bold">{userTokens}</span>
                  </div>
                </div>
                <hr className="my-2" />
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Sisa Token:</span>
                  <div className="flex items-center gap-2">
                    <TbCoins className="h-5 w-5 text-orange-600" />
                    <span className="font-bold text-green-600">
                      {userTokens - selectedPackage.price}
                    </span>
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
                {userTokens < selectedPackage.price
                  ? "Token Tidak Cukup"
                  : "Konfirmasi"}
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
      )} */}
    </div>
  );
}
