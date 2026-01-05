"use client";

import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { PackageCard } from "../(main)/beli-paket/package-card";
import { RiCoinsLine } from "react-icons/ri";

interface TokenCardProps {
  tokenAmount: number;
  isMini: boolean;
}

export default function TokenCard({ tokenAmount, isMini }: TokenCardProps) {
  const { data: session } = useSession();
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [selectedTokens, setSelectedTokens] = useState(10);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [tokenPackages, setTokenPackages] = useState([
    { amount: 1, price: 10000 },
    { amount: 2, price: 20000 },
    { amount: 5, price: 50000 },
    { amount: 10, price: 100000 },
  ]);

  const {
    data: pricingData,
    isLoading: isPricingLoading,
    isError: isPricingError,
  } = api.payment.getPrice.useQuery();

  useEffect(() => {
    if (pricingData) {
      setTokenPackages([
        { amount: 1, price: pricingData.tokenPrice * 1 },
        { amount: 2, price: pricingData.tokenPrice * 2 },
        { amount: 5, price: pricingData.tokenPrice * 5 },
        { amount: 10, price: pricingData.tokenPrice * 10 },
      ]);
    }
  }, [pricingData]);

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

  const handleTokenSelect = (amount: number) => {
    setSelectedTokens(amount);
  };

  const handleBuyTokens = () => {
    setShowTokenDialog(false);
    setIsRedirecting(true);

    const selectedPkg = tokenPackages.find(
      (pkg) => pkg.amount === selectedTokens,
    );
    if (!selectedPkg) {
      toast.error("Paket token tidak ditemukan");
      setIsRedirecting(false);
      return;
    }

    const idempotencyKey = crypto.randomUUID();

    createPayment.mutate({
      idempotencyKey,
      type: "token",
      userId: session?.user.id,
      amount: selectedPkg.price,
      tokens: selectedPkg.amount,
    });
  };

  return (
    <>
      {isMini ? (
        <div className="flex max-w-[150px] items-center rounded-lg border border-gray-500 bg-[#e9e6ef]">
          <div className="md:text-md flex flex-1 flex-col items-center justify-center rounded-lg bg-white px-4 py-2 text-xs">
            {/* border-r border-gray-500 */}
            <h3 className="text-center">Token TryOut</h3>
            <div className="flex items-center justify-center">
              <img
                src="/coinstack.png"
                alt="Token Icon"
                className="mb-1 size-6"
              />
              <span className="ml-1 text-gray-700">:</span>
              <span className="ml-2 text-xl font-bold text-gray-700">
                {tokenAmount}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-none bg-transparent hover:bg-transparent"
            onClick={() => setShowTokenDialog(true)}
            disabled={isRedirecting || isPricingLoading || isPricingError}
          >
            <Plus className="h-4 w-4 font-bold text-[#615e52]" />
          </Button>
        </div>
      ) : (
        <PackageCard
          title="Beli Token"
          description="Beli token untuk mengakses try out!"
          price={`Rp${pricingData.tokenPrice.toLocaleString("id-ID")},00`}
          features={[
            "1 Token untuk setiap try out",
            "Token berlaku selamanya",
            "Beli sesuai kebutuhanmu",
            "Pembayaran cepat dan aman",
            "Dukungan pelanggan responsif",
          ]}
          icon={<RiCoinsLine className="h-16 w-16 text-yellow-600" />}
          onClick={() => setShowTokenDialog(true)}
          disabled={isRedirecting || isPricingLoading || isPricingError}
        />
      )}

      {/* Token Purchase Dialog */}
      {showTokenDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Beli Token</h3>
              <button
                onClick={() => setShowTokenDialog(false)}
                className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-red-500 font-bold text-white transition-colors hover:bg-red-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <p className="mb-4 text-gray-600">
                Pilih paket token yang sesuai dengan kebutuhan Anda
              </p>

              {/* Token Packages */}
              <div className="space-y-3">
                {tokenPackages.map((pkg) => (
                  <div
                    key={pkg.amount}
                    className={`cursor-pointer rounded-lg border p-4 transition-all ${
                      selectedTokens === pkg.amount
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleTokenSelect(pkg.amount)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                            selectedTokens === pkg.amount
                              ? "border-green-500 bg-green-500"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedTokens === pkg.amount && (
                            <div className="h-2 w-2 rounded-full bg-white"></div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <img
                              src="/coinstack.png"
                              alt="Token"
                              className="h-5 w-5"
                            />
                            <span className="text-lg font-semibold">
                              {pkg.amount} Token
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          Rp {pkg.price.toLocaleString("id-ID")}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Package Summary */}
            <div className="mb-6 rounded-lg bg-gray-50 p-4">
              <h4 className="mb-2 font-semibold">Ringkasan Pembelian</h4>
              {(() => {
                const selectedPkg = tokenPackages.find(
                  (pkg) => pkg.amount === selectedTokens,
                );
                return selectedPkg ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Paket Token:</span>
                      <span className="font-medium">
                        {selectedPkg.amount} Token
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Harga:</span>
                      <span className="font-medium">
                        Rp {selectedPkg.price.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Total Token Anda:</span>
                      <div className="flex items-center gap-2">
                        <img
                          src="/coinstack.png"
                          alt="Token"
                          className="h-4 w-4"
                        />
                        <span>
                          {tokenAmount} + {selectedPkg.amount} ={" "}
                          {tokenAmount + selectedPkg.amount}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="default"
                onClick={handleBuyTokens}
                className="flex-1"
                disabled={isRedirecting}
              >
                {isRedirecting ? "Memproses..." : "Beli Sekarang"}
              </Button>
              <Button
                onClick={() => setShowTokenDialog(false)}
                variant="outline"
                className="flex-1"
                disabled={isRedirecting}
              >
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
