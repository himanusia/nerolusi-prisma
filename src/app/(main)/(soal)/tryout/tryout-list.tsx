"use client";

import { Button } from "~/app/_components/ui/button";
import ErrorPage from "~/app/error";
import LoadingPage from "~/app/loading";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import TryOutCard, { type TryOutData } from "~/app/_components/tryout-card";
import Image from "next/image";

interface TryoutListProps {
  classId?: number;
}

const TryoutList = ({ classId }: TryoutListProps) => {
  const router = useRouter();
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  const {
    data: packages,
    isLoading,
    isError,
  } = api.package.getTryoutPackages.useQuery({ classId });

  const handlePurchaseClick = (pkg: any) => {
    setSelectedPackage(pkg);
    setShowPurchaseDialog(true);
  };

  const convertPackageToTryOutData = (pkg: any, index: number): TryOutData => {
    const status = getPackageStatus(pkg);
    const packageNumber = index + 1;
    
    let tryOutStatus: TryOutData["status"];
    switch (status.type) {
      case 'completed':
        tryOutStatus = 'finished';
        break;
      case 'purchased':
        tryOutStatus = 'available';
        break;
      default:
        tryOutStatus = 'upcoming';
        break;
    }

    return {
      id: pkg.id,
      title: pkg.name,
      subtitle: `Try Out #${packageNumber}`,
      dateRange: pkg.TOstart && pkg.TOend ? 
        `${new Date(pkg.TOstart).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long'
        })} - ${new Date(pkg.TOend).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })}` : 'Tanggal belum ditentukan',
      status: tryOutStatus,
      number: packageNumber.toString(),
      participants: 0,
      difficulty: 'medium',  
      token: status.showCoin ? status.cost : undefined
    };
  };

  const getPackageStatus = (pkg: any) => {
    const isPackageEndDatePassed = new Date(pkg.TOend) < new Date();
    const isPackageStarted = new Date(pkg.TOstart) <= new Date();
    
    const hash = pkg.id.toString().split('').reduce((a: number, b: string) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const isPurchased = Math.abs(hash) % 3 !== 0;
    const isCompleted = isPackageEndDatePassed && isPurchased;

    if (isCompleted) {
      return {
        type: 'completed',
        bgColor: 'bg-green-500',
        textColor: 'text-white',
        buttonText: 'Lihat Hasil',
        showArrow: false,
        showCoin: false
      };
    } else if (isPurchased && isPackageStarted) {
      return {
        type: 'purchased',
        bgColor: 'bg-white',
        textColor: 'text-black',
        buttonText: 'Mulai',
        showArrow: true,
        showCoin: false
      };
    } else {
      return {
        type: 'unpurchased',
        bgColor: 'bg-white',
        textColor: 'text-black',
        buttonText: 'Beli',
        showArrow: false,
        showCoin: true,
        cost: pkg.cost ?? 1,
      };
    }
  };

  const handleCardClick = (pkg: any) => {
    const status = getPackageStatus(pkg);
    
    if (status.type === 'completed') {
      router.push(`/tryout/${pkg.id}/scores`);
    } else if (status.type === 'purchased') {
      router.push(`/tryout/${pkg.id}`);
    } else {
      handlePurchaseClick(pkg);
    }
  };

  const handleTryOutClick = (tryOut: TryOutData) => {
    const pkg = packages?.find(p => p.id === tryOut.id);
    if (pkg) {
      handleCardClick(pkg);
    }
  };

  return isError ? (
    <ErrorPage />
  ) : isLoading ? (
    <LoadingPage />
  ) : (
    <>
      {/* Try Out Cards Section */}
      <div className="space-y-4 flex flex-col items-start w-full">
        <div className="flex flex-col items-start justify-between">
          <h3 className="text-xl font-bold text-gray-900 text-left">Try Out Tersedia</h3>
          <p className="text-gray-600">
            Kerjakan Try Out mu untuk melihat hasil belajarmu!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mx-4">
          {packages?.map((pkg, index) => {
            const tryOutData = convertPackageToTryOutData(pkg, index);

            return (
              <TryOutCard
                key={pkg.id}
                tryOut={tryOutData}
                onTryOutClick={handleTryOutClick}
              />
            );
          })}
        </div>

        {packages?.length === 0 && (
          <div className="py-12 text-start text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium">Tidak ada try out yang tersedia</p>
            <p className="text-sm">Try out akan muncul di sini ketika tersedia</p>
          </div>
        )}
      </div>

      {/* Purchase Dialog */}
      {showPurchaseDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Pembelian TO</h3>
              <button 
                onClick={() => setShowPurchaseDialog(false)}
                className="w-8 h-8 bg-[#ff3d00] text-white font-bold rounded-[10px] flex items-center justify-center hover:bg-red-600"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-6">
              <h4 className="text-[#2b8057] text-xl font-bold mb-2">
                Apakah anda yakin untuk membeli TO ini?
              </h4>
              <p className="text-gray-600">
                Apabila pembelian TO sudah dilakukan, anda tidak akan bisa mengembalikan koin anda kembali! apakah yakin untuk melanjutkan pembelian?
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  // Handle purchase logic here
                  console.log('Purchase confirmed for:', selectedPackage);
                  setShowPurchaseDialog(false);
                }}
                className="flex-1 text-[#2b8057] font-bold"
              >
                <Image src="/coin.webp" alt="Coin" className="w-5 h-5 mr-2" width={20} height={20} />
                {/* TODO: change this to real coin amount for package. Bener ga? gw ngikut yg lain :D */}
                Ya {selectedPackage?.cost}
              </Button>
              <Button
                onClick={() => setShowPurchaseDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Tidak
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TryoutList;
