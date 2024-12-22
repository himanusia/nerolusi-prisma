import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthDialog() {
  const session = useSession();
  const user = session.data?.user;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"ghost"} className="border">
          {user ? "Sign Out" : "Sign In"}
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
          <Button
            variant={"ghost"}
            onClick={() => signOut({ callbackUrl: "/signin" })}
            className="border"
          >
            Sign Out
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
