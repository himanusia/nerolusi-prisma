"use client";

import { signIn } from "next-auth/react";
import { Button } from "../../_components/ui/button";
import { FaGoogle } from "react-icons/fa";

export default function AuthPage() {
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
