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
import { useSession } from "next-auth/react";
import AuthDialog from "./auth-dialog";
import { GoFile, GoVideo } from "react-icons/go";
import { GrScorecard } from "react-icons/gr";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { signIn } from "next-auth/react";
import { FaGoogle } from "react-icons/fa";
import { usePathname } from "next/navigation";
import { HiHome, HiMiniVideoCamera } from "react-icons/hi2";
import { RiPencilFill, RiToolsFill, RiBook2Fill } from "react-icons/ri";

const soal: { title: string; href: string }[] = [
  {
    title: "Kemampuan Penalaran Umum",
    href: "/drill/pu",
  },
  {
    title: "Pengetahuan dan Pemahaman Umum",
    href: "/drill/ppu",
  },
  {
    title: "Kemampuan Memahami Bacaan dan Menulis",
    href: "/drill/pbm",
  },
  {
    title: "Pengetahuan Kuantitatif",
    href: "/drill/pk",
  },
  {
    title: "Penalaran Matematika",
    href: "/drill/pm",
  },
  {
    title: "Literasi Bahasa Inggris",
    href: "/drill/lbe",
  },
  {
    title: "Literasi Bahasa Indonesia",
    href: "/drill/lbi",
  },
];

const menu: { title: string; href: string; logo: JSX.Element }[] = [
  {
    title: "File",
    href: "/file",
    logo: <GoFile />,
  },
  {
    title: "Video",
    href: "/video",
    logo: <GoVideo />,
  },
  {
    title: "My Scores",
    href: "/my-scores",
    logo: <GrScorecard />,
  },
];

const navigationItems = [
  {
    title: "Home",
    href: "/",
    icon: <HiHome className="h-5 w-5"/>,
    isActive: (pathname: string) => pathname === "/",
  },
  {
    title: "Tryout",
    href: "/tryout",
    icon: <RiPencilFill className="h-5 w-5"/>,
    isActive: (pathname: string) => pathname === "/tryout",
  },
  {
    title: "Drill",
    href: "/drill",
    icon: <RiToolsFill className="h-5 w-5"/>,
    isActive: (pathname: string) => pathname.startsWith("/drill"),
  },
  {
    title: "Rekaman",
    href: "/rekaman",
    icon: <HiMiniVideoCamera className="h-5 w-5"/>,
    isActive: (pathname: string) => pathname.startsWith("/rekaman"),
  },
  {
    title: "Modul",
    href: "/modul",
    icon: <RiBook2Fill className="h-5 w-5"/>,
    isActive: (pathname: string) => pathname.startsWith("/modul"),
  },
];

export default function Navbar() {
  const session = useSession();
  const user = session.data?.user;
  const pathname = usePathname();

  return (
    <div className="sticky left-0 top-3 z-50 flex h-16 w-full items-center justify-between px-16 bg-white border-b">
      {/* logo & menu*/}
      <div className="flex items-center gap-5">
        <Link href={"/"}>
          <Image
            src={"/logo2.png"}
            alt={"logo nerolusi"}
            width={"150"}
            height={"100"}
          ></Image>
        </Link>

        <NavigationMenu>
          <NavigationMenuList className="flex gap-1">
            {navigationItems.map((item) => (
              <NavigationMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <NavigationMenuLink className={getNavLink(item.isActive(pathname))}>
                    <div className="flex flex-col items-center gap-1 font-bold">
                      {item.icon}
                      <span className="text-xs">{item.title}</span>
                    </div>
                  </NavigationMenuLink>
                </Link>
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
    "after:absolute after:bottom-0 after:left-0 after:h-1 after:w-full after:origin-left after:scale-x-0 after:bg-green-600 after:transition-transform after:duration-200",
    "hover:after:scale-x-100",
    isActive ? "after:scale-x-100" : "text-black"
  );
}