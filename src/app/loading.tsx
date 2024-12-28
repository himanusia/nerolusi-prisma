"use client";

import { SquareLoader } from "react-spinners";

export default function LoadingPage() {
  return (
    <div className="flex h-[70vh] w-full items-center justify-center overflow-hidden">
      <SquareLoader color={"#22c55e"} loading={true} />
    </div>
  );
}
