"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "./ui/button"
import { cn } from "~/lib/utils"
import { useSession } from "next-auth/react"
import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { signIn } from "next-auth/react"
import { FaGoogle } from "react-icons/fa"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import type { NavigationItem } from "./navbar"

interface DesktopNavbarProps {
  navigationItems: NavigationItem[]
}

export default function MobileNavbar({ navigationItems }: DesktopNavbarProps) {
  const session = useSession()
  const user = session.data?.user
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="sticky left-0 top-0 z-50 flex h-16 w-full items-center justify-between px-4 bg-white border-b">
      <Link href="/">
        <Image src="/logo2.png" alt="logo nerolusi" width={100} height={30} />
      </Link>

      <div className="relative" ref={dropdownRef}>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            {user && (
              <div className="flex items-center gap-3 p-4 border-b">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.image || ""} />
                  <AvatarFallback className="text-lg font-semibold">{user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-semibold text-lg">{user.name}</span>
                  <span className="text-sm text-gray-600">{user.email}</span>
                </div>
              </div>
            )}

            <div className="p-4">
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-lg transition-colors",
                      item.isActive(pathname)
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "hover:bg-gray-50",
                    )}
                  >
                    <div className="text-xl">{item.icon}</div>
                    <span className="text-lg font-medium">{item.title}</span>
                  </Link>
                ))}
              </nav>

              {!user && (
                <div className="mt-4">
                  <Button
                    onClick={() => {
                      signIn("google", {
                        callbackUrl: "/",
                      })
                      setIsOpen(false)
                    }}
                    className="w-full"
                  >
                    <FaGoogle className="mr-2" />
                    Sign In
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
