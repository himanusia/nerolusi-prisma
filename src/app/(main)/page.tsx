"use client";

import { api } from "~/trpc/react";
import { Avatar, AvatarFallback, AvatarImage } from "../_components/ui/avatar";

export default function MainPage() {
  const { data: user, isLoading, isError } = api.user.getSessionUser.useQuery();
  return isError ? (
    <div></div>
  ) : isLoading ? (
    <div></div>
  ) : (
    <div className="flex size-full flex-col items-center justify-center gap-4">
      <Avatar>
        <AvatarImage src={`${user.image}`} />
        <AvatarFallback>{user.name}</AvatarFallback>
      </Avatar>
      <p>{user.name}</p>
      {user.classid && <p>{user.classid}</p>}
      <p>{user.email}</p>
      <p>{user.role}</p>
    </div>
  );
}
