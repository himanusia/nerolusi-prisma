"use client";

import { redirect } from "next/navigation";
import { useMode } from "~/contexts/mode-context";

export default function VideoPage() {
  const { mode } = useMode();

  redirect(`/video/${mode}`);
}
