"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

export type Mode = "tka" | "utbk";

interface ModeContextType {
  mode: Mode;
  setMode: (mode: Mode) => void;
  isTka: boolean;
  isUtbk: boolean;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mode, setModeState] = useState<Mode>("utbk");

  // Detect mode from pathname
  useEffect(() => {
    if (pathname.includes("/tka")) {
      setModeState("tka");
    } else if (pathname.includes("/utbk")) {
      setModeState("utbk");
    } else {
      // Load from localStorage if no mode in path
      const savedMode = localStorage.getItem("nerolusi-mode") as Mode | null;
      if (savedMode) {
        setModeState(savedMode);
      }
    }
  }, [pathname]);

  // Save to localStorage when mode changes
  const setMode = (newMode: Mode) => {
    setModeState(newMode);
    localStorage.setItem("nerolusi-mode", newMode);
  };

  // Handle automatic redirects for pages that should have mode prefix
  useEffect(() => {
    const pagesToRedirect = ["/tryout", "/drill", "/video", "/modul"];
    const isRedirectPage = pagesToRedirect.some((page) => pathname === page);

    if (isRedirectPage) {
      // Redirect to mode-specific page
      router.replace(`${pathname}/${mode}`);
    }
  }, [pathname, mode, router]);

  const value: ModeContextType = {
    mode,
    setMode,
    isTka: mode === "tka",
    isUtbk: mode === "utbk",
  };

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export function useMode() {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error("useMode must be used within a ModeProvider");
  }
  return context;
}
