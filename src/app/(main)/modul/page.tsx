"use client";

import { redirect } from "next/navigation";
import { useMode } from "~/contexts/mode-context";

export default function ModulPage() {
  const { mode } = useMode();

  redirect(`/modul/${mode}`);
}
