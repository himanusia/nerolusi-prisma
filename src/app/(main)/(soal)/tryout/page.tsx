"use client";

import { useSession } from "next-auth/react";
import { TbTargetArrow } from "react-icons/tb";
import TokenCard from "~/app/_components/token-card";
import TryoutList from "./tryout-list";

export default function TryoutListPage() {
  const { data: session } = useSession();

  // const classId = session?.user?.classid;

  const userTokens = session?.user?.token ?? 0;

  // if (!classId) {
  //   return (
  //     <div className="flex h-[70vh] flex-col items-center justify-center">
  //       <h1 className="text-2xl font-bold">
  //         You are not enrolled in any class
  //       </h1>
  //       <p className="mt-2">
  //         Please contact your administrator to assign you to a class.
  //       </p>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-6 w-full">
      <div className="bg-[#e9e6ef] rounded-[10px] p-3">
        <div className="flex items-center gap-4">
          <TbTargetArrow className="w-20 h-20 text-[#2b8057]" />
          <h1 className="text-3xl font-bold text-[#2b8057]">Try Out</h1>
        </div>
      </div>
      <TokenCard tokenAmount={userTokens} />

      <TryoutList />
    </div>
  );
}
