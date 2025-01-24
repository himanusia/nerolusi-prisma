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
import React from "react";

const soals: { title: string; href: string }[] = [
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
    title: "Literasi Bahasa Indonesia dan Bahasa Inggris",
    href: "/drill/lb",
  },
  {
    title: "Penalaran Matematika",
    href: "/drill/pm",
  },
];

export default function Navbar() {
  const session = useSession();
  const user = session.data?.user;

  return (
    <div className="sticky left-0 top-0 z-50 flex h-10 w-screen items-center justify-center gap-3 bg-background py-6 shadow-lg scrollbar scrollbar-none">
      <Link href={"/"}>
        <Image
          src={"/logo.png"}
          alt={"logo nerolusi"}
          width={"36"}
          height={"36"}
        ></Image>
      </Link>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Drill</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                {soals.map((soal) => (
                  <ListItem
                    key={soal.title}
                    title={soal.title}
                    href={soal.href}
                  ></ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/tryout" legacyBehavior passHref>
              <Button variant={"ghost"}>Try Out</Button>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/video" legacyBehavior passHref>
              <Button variant={"ghost"} className="flex gap-2">
                <GoVideo />
                <div className="hidden md:block">Video</div>
              </Button>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/file" legacyBehavior passHref>
              <Button variant={"ghost"} className="flex gap-2">
                <GoFile />
                <div className="hidden md:block">File</div>
              </Button>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      {user?.role === "admin" && (
        <Link href={"/user"} className="rounded-lg border p-2">
          Manajemen Akun
        </Link>
      )}
      {user?.role !== "user" && (
        <Link href={"/packageManagement"} className="rounded-lg border p-2">
          Manajemen Soal
        </Link>
      )}
      <AuthDialog />
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
            "flex size-full select-none items-center justify-center space-y-1 rounded-md border p-3 text-center leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
