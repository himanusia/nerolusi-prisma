"use client";

import { api } from "~/trpc/react";
import { Avatar, AvatarFallback, AvatarImage } from "../_components/ui/avatar";

export default function MainPage() {
  const {
    data: user,
    isLoading: sessionLoading,
    isError: sessionError,
  } = api.user.getSessionUser.useQuery();
  const {
    data: announcement,
    isLoading: announcementLoading,
    isError: announcementError,
  } = api.quiz.getAnnouncement.useQuery();

  return sessionError || announcementError ? (
    <div>error</div>
  ) : sessionLoading || announcementLoading ? (
    <div>loading</div>
  ) : (
    <div className="flex size-full flex-col items-center justify-center gap-4">
      <div className="flex flex-col items-center gap-2">
        <Avatar>
          <AvatarImage src={`${user.image}`} />
          <AvatarFallback>{user.name}</AvatarFallback>
        </Avatar>
        <p>{user.name}</p>
        {user.classid && <p>{user.classid}</p>}
        <p>{user.email}</p>
        <p>{user.role}</p>
      </div>
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl">{announcement?.title}</h1>
        <p>{announcement?.content}</p>
      </div>
    </div>
  );
}
