"use client";

import { redirect } from "next/navigation";
import { useMode } from "~/contexts/mode-context";

export default function TryoutListPage() {
  const { mode } = useMode();

  redirect(`/tryout/${mode}`);
}
