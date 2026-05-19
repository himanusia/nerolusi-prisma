"use client";

import Link from "next/link";
import Image from "next/image";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";
import { Button } from "./ui/button";
import { cn } from "~/lib/utils";
import { useSession, signOut, signIn } from "next-auth/react";
// import { GoFile, GoVideo } from "react-icons/go";
// import { GrScorecard } from "react-icons/gr";
import React, { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { FaGoogle } from "react-icons/fa";
import { usePathname } from "next/navigation";
import { HiMenu, HiX } from "react-icons/hi";
import { HiHome, HiMiniVideoCamera } from "react-icons/hi2";
import { RiPencilFill, RiToolsFill, RiBook2Fill } from "react-icons/ri";
import { HiUser, HiShoppingCart, HiLogout } from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import { useMode } from "~/contexts/mode-context";

// const soal: { title: string; href: string }[] = [
//   {
//     title: "Kemampuan Penalaran Umum",
//     href: "/drill/pu",
//   },
//   {
//     title: "Pengetahuan dan Pemahaman Umum",
//     href: "/drill/ppu",
//   },
//   {
//     title: "Kemampuan Memahami Bacaan dan Menulis",
//     href: "/drill/pbm",
//   },
//   {
//     title: "Pengetahuan Kuantitatif",
//     href: "/drill/pk",
//   },
//   {
//     title: "Penalaran Matematika",
//     href: "/drill/pm",
//   },
//   {
//     title: "Literasi Bahasa Inggris",
//     href: "/drill/lbe",
//   },
//   {
//     title: "Literasi Bahasa Indonesia",
//     href: "/drill/lbi",
//   },
// ];

// const menu: { title: string; href: string; logo: JSX.Element }[] = [
//   {
//     title: "File",
//     href: "/file",
//     logo: <GoFile />,
//   },
//   {
//     title: "Video",
//     href: "/video",
//     logo: <GoVideo />,
//   },
//   {
//     title: "My Scores",
//     href: "/my-scores",
//     logo: <GrScorecard />,
//   },
// ];

// interface NavbarProps {
//   isTka: boolean;
// }

export default function Navbar() {
  const session = useSession();
  const user = session.data?.user;
  const pathname = usePathname();
  const { mode, isTka, isUtbk } = useMode();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const closeProfileDropdown = () => {
    setIsProfileDropdownOpen(false);
  };

  const handleLogout = () => {
    signOut({
      callbackUrl: "/",
    });
    closeProfileDropdown();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        isMobileMenuOpen
      ) {
        closeMobileMenu();
      }
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node) &&
        isProfileDropdownOpen
      ) {
        closeProfileDropdown();
      }
    };

    if (isMobileMenuOpen || isProfileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen, isProfileDropdownOpen]);

  const navigationItems = [
    {
      title: "Home",
      href: `/${mode}`,
      icon: <HiHome className="h-5 w-5" />,
      isActive: (pathname: string) =>
        pathname === "/" ||
        pathname.startsWith("/tka") ||
        pathname.startsWith("/utbk"),
    },
    {
      title: "Tryout",
      href: `/tryout/${mode}`,
      icon: <RiPencilFill className="h-5 w-5" />,
      isActive: (pathname: string) => pathname.startsWith("/tryout"),
    },
    // {
    //   title: "Drill",
    //   href: "/drill",
    //   icon: <RiToolsFill className="h-5 w-5"/>,
    //   isActive: (pathname: string) => pathname.startsWith("/drill"),
    // },
    {
      title: "Video",
      href: `/video/${isTka ? "tka/materi" : "utbk"}`,
      icon: <HiMiniVideoCamera className="h-5 w-5" />,
      isActive: (pathname: string) => pathname.startsWith("/video"),
    },
    // {
    //   title: "Modul",
    //   href: `/modul/${mode}`,
    //   icon: <RiBook2Fill className="h-5 w-5" />,
    //   isActive: (pathname: string) => pathname.startsWith("/modul"),
    // },
    {
      title: "Bantuan",
      href: "https://wa.me/6285591402079",
      icon: <FaWhatsapp className="h-5 w-5" />,
      isActive: (pathname: string) => pathname.startsWith("/whatsapp"),
    },
  ];

  return (
    <div className="sticky left-0 top-0 z-50 flex h-16 w-full items-center justify-between border-[1px] border-b border-[#acaeba] bg-white px-12">
      <div className="flex items-center gap-5">
        <Link href={"/"}>
          <Image
            src={"/logo2.png"}
            alt={"logo nerolusi"}
            width={"150"}
            height={"100"}
          ></Image>
        </Link>

        <NavigationMenu className="hidden md:block">
          <NavigationMenuList className="flex gap-1">
            {navigationItems.map((item) => (
              <NavigationMenuItem key={item.href}>
                <NavigationMenuLink
                  className={getNavLink(item.isActive(pathname))}
                  href={item.href}
                >
                  <div className="flex flex-col items-center gap-1 font-bold">
                    {item.icon}
                    <span className="text-xs">{item.title}</span>
                  </div>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
            {/* {user?.classid && (
              <NavigationMenuItem>
                <NavigationMenuTrigger>Drill</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 lg:w-[600px] lg:grid-cols-2">
                    {soal.map((e) => (
                      <ListItem
                        key={e.title}
                        title={e.title}
                        href={e.href}
                      ></ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            )}
            <NavigationMenuItem>
              <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul
                  className={`grid w-[240px] gap-3 p-4 ${user?.classid && "lg:w-[600px] lg:grid-cols-2"}`}
                >
                  {user?.classid &&
                    menu.map((e) => (
                      <ListItem
                        key={e.title}
                        title={e.title}
                        href={e.href}
                        className="flex gap-2"
                      >
                        {e.logo}
                      </ListItem>
                    ))}
                  <AuthDialog />
                  {user?.role === "admin" && (
                    <Link
                      href={"/user"}
                      className="flex justify-center rounded-lg border p-2"
                    >
                      Manajemen Akun
                    </Link>
                  )}
                  {user?.role !== "user" && (
                    <Link
                      href={"/packageManagement"}
                      className="flex justify-center rounded-lg border p-2"
                    >
                      Manajemen Soal
                    </Link>
                  )}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem> */}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <div className="relative" ref={profileDropdownRef}>
              {/* <span className="text-sm text-black">{user.name}</span> */}

              <button
                onClick={toggleProfileDropdown}
                className="flex items-center gap-3 transition-opacity hover:opacity-80"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.image || ""} />
                  <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 top-12 z-50 w-48 rounded-lg border bg-white shadow-lg">
                  <div className="py-2">
                    {!isTka && (
                      <Link
                        href="/profil"
                        onClick={closeProfileDropdown}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        <HiUser className="h-4 w-4" />
                        Profil
                      </Link>
                    )}

                    <Link
                      href="/beli-paket"
                      onClick={closeProfileDropdown}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <HiShoppingCart className="h-4 w-4" />
                      Beli Paket
                    </Link>
                    <div className="my-2 border-t border-gray-100"></div>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                    >
                      <HiLogout className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button
              variant={"ghost"}
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

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMobileMenu}
            className="p-2"
          >
            {isMobileMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </Button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <>
          <div
            onClick={closeMobileMenu}
            className="fixed inset-0 z-40 md:hidden"
          />
          <div
            className="absolute left-0 right-0 top-16 z-50 border-[1px] border-[#acaeba] bg-white shadow-lg md:hidden"
            ref={mobileMenuRef}
          >
            <div className="p-4">
              {user ? (
                <div className="mb-4 flex items-center gap-3 border-b border-gray-200 pb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.image || ""} />
                    <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="text-sm font-medium text-black">
                      {user.name}
                    </span>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              ) : (
                <div className="mb-4 border-b border-gray-200 pb-4">
                  <Button
                    variant={"ghost"}
                    onClick={() => {
                      signIn("google", {
                        callbackUrl: "/",
                      });
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full border"
                  >
                    <FaGoogle className="mr-2" />
                    Sign In
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg p-3 transition-colors",
                      item.isActive(pathname)
                        ? "border border-green-200 bg-green-50 text-green-700"
                        : "text-gray-700 hover:bg-gray-50",
                    )}
                  >
                    {item.icon}
                    <span className="font-medium">{item.title}</span>
                  </Link>
                ))}
              </div>

              {user && (
                <>
                  <div className="mb-4 border-t border-gray-200 pt-4">
                    <div className="space-y-2">
                      {!isTka && (
                        <Link
                          href="/profil"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 rounded-lg p-3 text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          <HiUser className="h-5 w-5" />
                          <span className="font-medium">Profil</span>
                        </Link>
                      )}

                      <Link
                        href="/beli-paket"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg p-3 text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        <HiShoppingCart className="h-5 w-5" />
                        <span className="font-medium">Beli Paket</span>
                      </Link>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg p-3 text-left text-red-600 transition-colors hover:bg-red-50"
                  >
                    <HiLogout className="h-5 w-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "flex size-full select-none items-center justify-center gap-1 rounded-md border p-3 text-center leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className,
          )}
          {...props}
        >
          {children}
          <div className="text-sm font-medium leading-none">{title}</div>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

function getNavLink(isActive: boolean) {
  return cn(
    "relative px-4 py-2 text-sm font-medium transition-colors duration-200 h-16 flex items-center",
    "after:absolute after:bottom-0 after:left-0 after:h-1 after:w-full after:origin-left after:bg-[#2b8057] after:transition-transform after:duration-200",
    isActive ? "after:scale-x-100" : "after:scale-x-0",
    "hover:after:scale-x-100 text-black",
  );
}
