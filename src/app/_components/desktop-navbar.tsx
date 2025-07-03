"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "./ui/button"
import { cn } from "~/lib/utils"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { signIn } from "next-auth/react"
import { FaGoogle } from "react-icons/fa"
import { usePathname } from "next/navigation"
import type { NavigationItem } from "./navbar"

interface DesktopNavbarProps {
  navigationItems: NavigationItem[]
}

function getNavLink(isActive: boolean) {
  return cn(
    "relative px-4 py-2 text-sm font-medium transition-colors duration-200 h-16 flex items-center",
    "after:absolute after:bottom-0 after:left-0 after:h-1 after:w-full after:origin-left after:bg-green-600 after:transition-transform after:duration-200",
    isActive ? "after:scale-x-100" : "after:scale-x-0",
    "hover:after:scale-x-100 text-black",
  )
}

export default function DesktopNavbar({ navigationItems }: DesktopNavbarProps) {
  const session = useSession()
  const user = session.data?.user
  const pathname = usePathname()

  return (
    <div className="sticky left-0 top-0 z-50 flex h-16 w-full items-center justify-between px-16 bg-white border-b">
      <div className="flex items-center gap-5">
        <Link href="/">
          <Image src="/logo2.png" alt="logo nerolusi" width={150} height={100} />
        </Link>

        <nav className="flex gap-1">
          {navigationItems.map((item) => (
            <Link key={item.href} href={item.href} className={getNavLink(item.isActive(pathname))}>
              <div className="flex flex-col items-center gap-1 font-bold">
                {item.icon}
                <span className="text-xs">{item.title}</span>
              </div>
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-black">{user.name}</span>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.image || ""} />
              <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        ) : (
          <Button
            variant="ghost"
            onClick={() =>
              signIn("google", {
                callbackUrl: "/",
              })
            }
            className="border"
          >
            <FaGoogle className="mr-2" />
            Sign In
          </Button>
        )}
      </div>
    </div>
  )
}
