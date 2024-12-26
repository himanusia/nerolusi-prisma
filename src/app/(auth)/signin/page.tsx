"use client";

import { signIn, useSession } from "next-auth/react";
import { Button } from "../../_components/ui/button";
import { FaGoogle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthPage() {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.status === "authenticated") {
      router.push("/");
    }
  }, [session, router]);

  return (
    <div className="flex h-screen flex-col items-center justify-center">
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
    </div>
  );
}
