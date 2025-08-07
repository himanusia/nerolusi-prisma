"use client";

import { Button } from "./ui/button";
import { Plus, Minus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface TokenCardProps {
  tokenAmount: number;
}

export default function TokenCard({ tokenAmount }: TokenCardProps) {
  const router = useRouter();
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [selectedTokens, setSelectedTokens] = useState(10);

  const tokenPackages = [
    { amount: 10, price: 5000, bonus: 0 },
    { amount: 25, price: 12000, bonus: 2 },
    { amount: 50, price: 23000, bonus: 5 },
    { amount: 100, price: 45000, bonus: 15 },
  ];

  const handleTokenSelect = (amount: number) => {
    setSelectedTokens(amount);
  };

  const handleBuyTokens = () => {
    // Handle actual token purchase logic here
    console.log('Buying tokens:', selectedTokens);
    setShowTokenDialog(false);
    // You might want to show a success message or update token count
  };
  return (
    <>
      <div className="flex rounded-lg border border-gray-500 bg-[#e9e6ef] items-center max-w-[150px]">
        <div className="flex flex-1 flex-col items-center justify-center rounded-lg bg-white px-4 py-2 text-xs md:text-md border-r border-gray-500">
          <h3 className="text-center">Token TryOut</h3>
          <div className="flex items-center justify-center">
            <img
              src="/coinstack.png"
              alt="Token Icon"
              className="mb-1 size-6"
            />
            <span className="ml-1 text-gray-700">:</span>
            <span className="ml-2 text-gray-700 font-bold text-xl">{tokenAmount}</span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          className="bg-transparent rounded-none hover:bg-transparent"
          onClick={() => setShowTokenDialog(true)}
        >
          <Plus className="w-4 h-4 text-[#615e52] font-bold" />
        </Button>
      </div>

      {/* Token Purchase Dialog */}
      {showTokenDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Beli Token</h3>
              <button 
                onClick={() => setShowTokenDialog(false)}
                className="w-8 h-8 bg-red-500 text-white font-bold rounded-[10px] flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Pilih paket token yang sesuai dengan kebutuhan Anda
              </p>
              
              {/* Token Packages */}
              <div className="space-y-3">
                {tokenPackages.map((pkg) => (
                  <div
                    key={pkg.amount}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedTokens === pkg.amount
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleTokenSelect(pkg.amount)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedTokens === pkg.amount
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedTokens === pkg.amount && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <img
                              src="/coinstack.png"
                              alt="Token"
                              className="w-5 h-5"
                            />
                            <span className="font-semibold text-lg">
                              {pkg.amount + pkg.bonus} Token
                            </span>
                            {pkg.bonus > 0 && (
                              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                                +{pkg.bonus} Bonus
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            {pkg.amount} Token {pkg.bonus > 0 && `+ ${pkg.bonus} Bonus`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          Rp {pkg.price.toLocaleString('id-ID')}
                        </div>
                        {pkg.amount > 10 && (
                          <div className="text-xs text-gray-500">
                            Rp {Math.round(pkg.price / (pkg.amount + pkg.bonus)).toLocaleString('id-ID')}/token
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Package Summary */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold mb-2">Ringkasan Pembelian</h4>
              {(() => {
                const selectedPkg = tokenPackages.find(pkg => pkg.amount === selectedTokens);
                return selectedPkg ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Paket Token:</span>
                      <span className="font-medium">{selectedPkg.amount + selectedPkg.bonus} Token</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Harga:</span>
                      <span className="font-medium">Rp {selectedPkg.price.toLocaleString('id-ID')}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Total Token:</span>
                      <div className="flex items-center gap-2">
                        <img src="/coinstack.png" alt="Token" className="w-4 h-4" />
                        <span>{tokenAmount} + {selectedPkg.amount + selectedPkg.bonus} = {tokenAmount + selectedPkg.amount + selectedPkg.bonus}</span>
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
              >
                Beli Sekarang
              </Button>
              <Button
                onClick={() => setShowTokenDialog(false)}
                variant="outline"
                className="flex-1"
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
