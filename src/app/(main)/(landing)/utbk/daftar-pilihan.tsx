"use client";

import { Button } from "~/app/_components/ui/button";
import { api } from "~/trpc/react";
import Link from "next/link";
import { Skeleton } from "~/app/_components/ui/skeleton";

export default function DaftarPilihan() {
  const { data: profileData, isLoading } = api.user.getProfile.useQuery();

  const majorChoices = profileData?.majorChoices || [];

  return (
    <div className="container mx-auto w-fit flex-1 py-2">
      <div className="">
        <h1 className="mb-2 text-center text-3xl font-bold">
          Keep TRACK of your Score!
        </h1>
        <p className="text-muted-foreground">Passing Grade:</p>
      </div>

      <div className="mb-2 h-fit space-y-1">
        {isLoading ? (
          // Loading skeletons
          [...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex h-fit items-center justify-between gap-4 border-0 py-1"
            >
              <Skeleton className="h-16 w-28 rounded-xl" />
              <div className="flex-1 space-y-2 pl-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-64" />
              </div>
            </div>
          ))
        ) : majorChoices.length === 0 ? (
          // Empty state
          <div className="py-8 text-center text-gray-500">
            <p className="mb-2">Belum ada pilihan jurusan</p>
            <p className="text-sm">Silakan atur pilihan jurusan Anda di halaman profil</p>
          </div>
        ) : (
          // Display major choices
          majorChoices.map((choice) => (
            <div
              key={choice.id}
              className="flex h-fit items-center justify-between gap-4 border-0 py-1"
            >
              {/* Score Circle */}
              <div className="flex h-16 w-28 items-center justify-center rounded-xl border-2 border-gray-300">
                <span className="text-3xl font-bold">
                  {choice.major.passingGrade || "-"}
                </span>
              </div>

              {/* Choice Info */}
              <div className="flex-1 border-l-[6px] border-green-600 pl-4">
                <h3 className="text-lg font-semibold">
                  Pilihan {choice.choiceNumber}
                </h3>
                <p className="text-sm font-medium text-gray-900">
                  {choice.major.university.name}
                </p>
                <p className="text-xs text-gray-600">{choice.major.name}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="text-center">
        <Link href="/profil">
          <Button variant="outline" size="lg">
            Ganti Pilihan
          </Button>
        </Link>
      </div>
    </div>
  );
}
