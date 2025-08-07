"use client";

import { Button } from "~/app/_components/ui/button";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import TryOutCard, { type TryOutData } from "~/app/_components/tryout-card";

interface TryOutTersediaProps {
  tryOuts: TryOutData[];
  onTryOutClick?: (tryOut: TryOutData) => void;
}

export default function TryOutTersedia({ tryOuts, onTryOutClick }: TryOutTersediaProps) {
  const router = useRouter();

  return (
    <div className="space-y-4 overflow-auto">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Try Out Tersedia</h3>
          <p className="text-gray-600">
            Kerjakan Try Out mu untuk melihat hasil belajarmu!
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push('/tryout')}>
          Lihat semua <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-2 w-full overflow-x-scroll scrollbar-thin scrollbar-track-transparent pb-2">
        {tryOuts.map((tryOut) => (
          <TryOutCard 
            key={tryOut.id} 
            tryOut={tryOut} 
            onTryOutClick={onTryOutClick} 
          />
        ))}
      </div>

      {tryOuts.length === 0 && (
        <div className="py-8 text-center text-muted-foreground">
          Tidak ada try out yang tersedia saat ini
        </div>
      )}
    </div>
  );
}
