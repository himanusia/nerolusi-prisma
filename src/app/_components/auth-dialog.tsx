"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { signIn, signOut, useSession } from "next-auth/react";
import { CiLogout } from "react-icons/ci";
import { useRouter } from "next/navigation";

export default function AuthDialog() {
  const session = useSession();
  const router = useRouter();
  const user = session.data?.user;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"ghost"} className="border">
          <CiLogout className="rotate-180 transform" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user ? "Sign Out" : "Sign In"}</DialogTitle>
        </DialogHeader>
        {!user ? (
          <Button
            variant={"ghost"}
            onClick={() => signIn("google")}
            className="border"
          >
            Sign In
          </Button>
        ) : (
          <div className="flex size-full flex-col gap-3">
            Are you sure you want to sign out?
            <Button
              variant={"ghost"}
              onClick={() => signOut({ callbackUrl: "/signin" })}
              className="gap-3 border"
            >
              <CiLogout className="rotate-180 transform" />
              Sign Out
            </Button>
            {user?.role === "admin" && (
              <Button
                className="md:hidden"
                variant={"outline"}
                onClick={() => router.push("/user")}
                asChild
              >
                Manajemen Akun
              </Button>
            )}
            {user?.role !== "user" && (
              <Button
                className="md:hidden"
                variant={"outline"}
                onClick={() => router.push("/packageManagement")}
                asChild
              >
                Manajemen Soal
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
