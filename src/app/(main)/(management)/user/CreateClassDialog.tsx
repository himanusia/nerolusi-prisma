"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/app/_components/ui/dialog";
import { Button } from "~/app/_components/ui/button";
import { useState } from "react";
import { api } from "~/trpc/react";

export default function CreateClassDialog() {
  const [className, setClassName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const createClassApi = api.class.createClass.useMutation();

  const handleSubmit = async () => {
    setIsDialogOpen(false);
    try {
      await createClassApi.mutateAsync({ name: className });
      setClassName("");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="border">Create Class</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Class</DialogTitle>
        </DialogHeader>
        <input
          type="text"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          placeholder="Enter class name"
          className="w-full border p-2"
        />
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={!className}>
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
