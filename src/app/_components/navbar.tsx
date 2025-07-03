"use client"
import MobileNavbar from "./mobile-navbar"
import DesktopNavbar from "./desktop-navbar"
import { useState, useEffect } from "react"
import { HiHome, HiMiniVideoCamera } from "react-icons/hi2"
import { RiPencilFill, RiToolsFill, RiBook2Fill } from "react-icons/ri"

export type NavigationItem = {
  title: string
  href: string
  icon: React.ReactNode
  isActive: (pathname: string) => boolean
}

const navigationItems: NavigationItem[] = [
  {
    title: "Home",
    href: "/",
    icon: <HiHome className="h-5 w-5" />,
    isActive: (pathname: string) => pathname === "/",
  },
  {
    title: "Tryout",
    href: "/tryout",
    icon: <RiPencilFill className="h-5 w-5" />,
    isActive: (pathname: string) => pathname === "/tryout",
  },
  {
    title: "Drill",
    href: "/drill",
    icon: <RiToolsFill className="h-5 w-5" />,
    isActive: (pathname: string) => pathname.startsWith("/drill"),
  },
  {
    title: "Rekaman",
    href: "/rekaman",
    icon: <HiMiniVideoCamera className="h-5 w-5" />,
    isActive: (pathname: string) => pathname.startsWith("/rekaman"),
  },
  {
    title: "Modul",
    href: "/modul",
    icon: <RiBook2Fill className="h-5 w-5" />,
    isActive: (pathname: string) => pathname.startsWith("/modul"),
  },
]

export default function Navbar() {
  const isMobile = useMobile()

  if (isMobile) {
    return <MobileNavbar navigationItems={navigationItems}/>
  }

  return <DesktopNavbar navigationItems={navigationItems}/>
}

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  return isMobile
}