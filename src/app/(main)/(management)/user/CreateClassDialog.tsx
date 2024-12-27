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
import { toast } from "sonner";
import { Input } from "~/app/_components/ui/input";

export default function CreateClassDialog() {
  const [className, setClassName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const createClass = api.class.createClass.useMutation();

  const handleSubmit = async () => {
    setIsDialogOpen(false);
    try {
      await createClass.mutateAsync({ name: className });
      setClassName("");
      toast.success("Class created successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Error creating class", {
        description: error.message,
      });
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
        <Input
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
