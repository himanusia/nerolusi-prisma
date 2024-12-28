"use client";

import { api } from "~/trpc/react";
import { Avatar, AvatarFallback, AvatarImage } from "../_components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../_components/ui/dialog";
import { Button } from "../_components/ui/button";
import { Input } from "../_components/ui/input";
import { Textarea } from "../_components/ui/textarea";
import { toast } from "sonner";
import ErrorPage from "../error";
import LoadingPage from "../loading";

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
    refetch: refetchAnnouncement,
  } = api.quiz.getAnnouncement.useQuery();

  const updateAnnouncement = api.quiz.upsertAnnouncement.useMutation({
    onSuccess: () => {
      toast.success("Announcement edited successfully!");
      refetchAnnouncement();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to edit announcement.");
    },
  });

  return sessionError || announcementError ? (
    <ErrorPage />
  ) : sessionLoading || announcementLoading ? (
    <LoadingPage />
  ) : (
    <div className="flex size-full flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-5 rounded-lg border px-5">
        <Avatar className="border">
          <AvatarImage src={`${user.image}`} />
          <AvatarFallback>{user.name}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-2 border-l p-3">
          <p>{user.name}</p>
          <p>{user.email}</p>
          {user?.class?.name && <p>{user.class.name}</p>}
        </div>
      </div>
      <div className="flex flex-col items-center gap-4 rounded-lg border p-5">
        <h1 className="text-2xl">{announcement?.title}</h1>
        <p>{announcement?.content}</p>
        {user.role === "admin" && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>Edit</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Edit Announcement</DialogTitle>
              <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const title = form.elements.namedItem(
                    "title",
                  ) as HTMLInputElement;
                  const content = form.elements.namedItem(
                    "content",
                  ) as HTMLTextAreaElement;
                  updateAnnouncement.mutate({
                    title: title.value,
                    content: content.value,
                  });
                }}
              >
                <Input
                  name="title"
                  defaultValue={announcement?.title}
                  placeholder="Title"
                />
                <Textarea
                  name="content"
                  defaultValue={announcement?.content}
                  placeholder="Content"
                  className="h-72"
                />
                <Button type="submit">Save</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
