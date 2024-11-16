/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import { useEffect, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { Button } from "~/app/_components/ui/button";
import { api } from "~/trpc/react";
import CreateQuestion from "./create-question";
import { type question } from "~/server/db/schema";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { DurationPicker } from "material-duration-picker";
import { formatDuration } from "date-fns";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "~/app/_components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "~/app/_components/ui/command";

export default function CreatePackage({ packageId }: { packageId: string }) {
  const [name, setName] = useState<string | undefined>("");
  const [type, setType] = useState<"tryout" | "drill" | undefined>(undefined);
  const [start, setStart] = useState<Dayjs | null>(null);
  const [end, setEnd] = useState<Dayjs | null>(null);
  const [duration, setDuration] = useState<string | null | undefined>("");
  const [classId, setClassId] = useState<number | null | undefined>(undefined);
  const [subtest, setSubtest] = useState<
    "pk" | "pu" | "ppu" | "pbm" | "lb" | "pm"
  >("pk");
  const [questions, setQuestions] = useState<question[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const allClasses = api.class.getAllClasses.useQuery();
  const createPackageApi = api.package.addPackage.useMutation();
  const createQuestionApi = api.question.addQuestion.useMutation();
  const { data, isLoading } = api.package.getOnePackage.useQuery(
    { packageId },
    {
      enabled: !!packageId,
    },
  );

  useEffect(() => {
    if (data) {
      setName(data.name);
      setType(data.type);
      setStart(data.TOstart ? dayjs(data.TOstart) : null);
      setEnd(data.TOend ? dayjs(data.TOend) : null);
      setDuration(data.TOduration);
      setClassId(data.classId);
      setQuestions(data.questions);
    }
  }, [data]);

  const addQuestion = async () => {
    const newQuestion = {
      packageId: Number(packageId),
      type: "mulChoice" as "essay" | "mulChoice",
      subtest: subtest,
      id: crypto.randomUUID(),
      index: (data?.questions.length ?? 0) + 1,
      content: "",
      imageUrl: null,
      score: null,
      explanation: null,
      correctAnswerId: null,
      createdAt: new Date(),
    };

    setQuestions((prev) => [...prev, newQuestion]);
    await createQuestionApi.mutateAsync(newQuestion);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPackageApi.mutateAsync({
      id: Number(packageId),
      name: name ?? "",
      type: type ?? "tryout",
      start: start?.toDate() ?? undefined,
      end: end?.toDate() ?? undefined,
      duration: duration ?? "",
      classId: classId ?? undefined,
    });
  };

  const handleClassSelect = (id: number) => {
    setClassId(id);
    setIsOpen(false);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const pkgTypeOptions: ("tryout" | "drill")[] = ["tryout", "drill"];
  const subtestOptions: string[] = ["pk", "pu", "ppu", "pbm", "lb", "pm"];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <h2>Create Package</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Package Name"
          required
          className="border p-2"
        />
        <select
          value={type}
          onChange={(e) =>
            setType(e.target.value as "tryout" | "drill" | undefined)
          }
          className="border p-2"
        >
          {pkgTypeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <DateTimePicker
          label="Start Date and Time"
          value={start}
          onChange={(newValue) => setStart(newValue)}
        />

        <DateTimePicker
          label="End Date and Time"
          value={end}
          onChange={(newValue) => setEnd(newValue)}
        />

        <input
          type="text"
          value={duration ?? ""}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="Duration (e.g., HH:MM)"
          className="border p-2"
        />

        <DurationPicker
          label="Duration"
          value={Number(duration) ?? ""}
          onValueChange={(value) => setDuration(value?.toString() ?? "")}
          formatDuration={formatDuration}
        />

        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start truncate">
              {allClasses.data?.find((cls) => cls.id === classId)?.name ??
                "Select a class"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[45vw] p-0">
            <Command>
              <CommandInput placeholder="Search class..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {allClasses.data?.length ? (
                    allClasses.data.map((cls) => (
                      <CommandItem
                        key={cls.id}
                        onSelect={() => handleClassSelect(cls.id)}
                      >
                        {cls.name}
                      </CommandItem>
                    ))
                  ) : (
                    <CommandItem>No classes available</CommandItem>
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <select
          value={subtest}
          onChange={(e) =>
            setSubtest(
              e.target.value as "pk" | "pu" | "ppu" | "pbm" | "lb" | "pm",
            )
          }
          className="border p-2"
        >
          {subtestOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        {questions.map((question) => (
          <CreateQuestion key={question.id} data={question} />
        ))}
        <Button type="button" onClick={addQuestion} variant={"outline"}>
          + Add Question
        </Button>
        <Button type="submit" variant={"outline"}>
          Create Package
        </Button>
      </form>
    </LocalizationProvider>
  );
}
