"use client";

import { Separator } from "~/app/_components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/app/_components/ui/tabs";

const toResult: {
  id: number;
  title: string;
  correct: number;
  all: number;
  score: number;
  subtest: {
    id: number;
    title: string;
    correct: number;
    all: number;
    score: number;
  }[];
}[] = [
  {
    id: 1,
    title: "Try Out 1",
    correct: 98,
    all: 170,
    score: 718,
    subtest: [
      {
        id: 1,
        title: "Kemampuan Penalaran Umum",
        correct: 10,
        all: 20,
        score: 50,
      },
      {
        id: 2,
        title: "Pengetahuan dan Pemahaman Umum",
        correct: 5,
        all: 10,
        score: 50,
      },
      {
        id: 3,
        title: "Pengetahuan dan Pemahaman Umum",
        correct: 5,
        all: 10,
        score: 50,
      },
      {
        id: 4,
        title: "Pengetahuan dan Pemahaman Umum",
        correct: 5,
        all: 10,
        score: 50,
      },
      {
        id: 5,
        title: "Pengetahuan dan Pemahaman Umum",
        correct: 5,
        all: 10,
        score: 50,
      },
      {
        id: 6,
        title: "Pengetahuan dan Pemahaman Umum",
        correct: 5,
        all: 10,
        score: 50,
      },
      {
        id: 7,
        title: "Pengetahuan dan Pemahaman Umum",
        correct: 5,
        all: 10,
        score: 50,
      },
      {
        id: 8,
        title: "Pengetahuan dan Pemahaman Umum",
        correct: 5,
        all: 10,
        score: 50,
      },
    ],
  },
];

export default function MyScoresPage() {
  return (
    <div className="mx-auto flex flex-col gap-4 rounded-lg border lg:w-3/5">
      <Tabs defaultValue="try-out" className="w-full">
        <TabsList className="grid w-full grid-cols-2 border-b">
          <TabsTrigger value="try-out">Try Outs</TabsTrigger>
          <TabsTrigger value="drilling">Drilling</TabsTrigger>
        </TabsList>
        <TabsContent value="try-out" className="min-h-[80vh] px-5 py-1">
          <ul className="grid gap-4">
            {toResult.map((result) => (
              <li key={result.id} className="flex rounded-lg border">
                <div className="rounded-lg border-r">
                  <div className="flex justify-center border-b p-1">
                    {result.title}
                  </div>
                  <div className="flex h-28 w-36 items-center justify-center border-b text-5xl font-bold">
                    {result.score}
                  </div>
                  <div className="flex justify-center p-1">
                    Benar {result.correct}/{result.all}
                  </div>
                </div>
                <ul className="m-3 h-[153px] w-full overflow-auto rounded-lg border px-2 py-1">
                  <div className="flex size-full flex-col gap-2 overflow-auto p-1 scrollbar scrollbar-thumb-current scrollbar-w-1 hover:scrollbar-thumb-foreground/50">
                    {result.subtest.map((subtest) => (
                      <li
                        key={subtest.id}
                        className="flex rounded-lg border px-3 py-1 text-sm"
                      >
                        <div className="w-full truncate font-semibold">
                          {subtest.title}
                        </div>
                        <div
                          className={`flex gap-2 ${!subtest.score && "hidden"} `}
                        >
                          <Separator
                            orientation="vertical"
                            className="border"
                          />
                          <div className={`flex min-w-12 justify-center`}>
                            {subtest.correct}/{subtest.all}
                          </div>
                          <Separator
                            orientation="vertical"
                            className="border"
                          />
                          <div
                            className={`flex min-w-12 justify-center rounded-lg border bg-green-500 font-bold`}
                          >
                            {subtest.score}
                          </div>
                        </div>
                      </li>
                    ))}
                  </div>
                </ul>
              </li>
            ))}
          </ul>
        </TabsContent>
        <TabsContent value="drilling" className="min-h-[80vh] px-5 py-1">
          <ul className="grid gap-4">
            {toResult.map((result) => (
              <li key={result.id} className="flex rounded-lg border">
                <div className="rounded-lg border-r">
                  <div className="flex justify-center border-b p-1">
                    {result.title}
                  </div>
                  <div className="flex h-28 w-36 items-center justify-center border-b text-5xl font-bold">
                    {result.score}
                  </div>
                  <div className="flex justify-center p-1">
                    Benar {result.correct}/{result.all}
                  </div>
                </div>
                <ul className="m-3 h-[153px] w-full overflow-auto rounded-lg border px-2 py-1">
                  <div className="flex size-full flex-col gap-2 overflow-auto p-1 scrollbar scrollbar-thumb-current scrollbar-w-1 hover:scrollbar-thumb-foreground/50">
                    {result.subtest.map((subtest) => (
                      <li
                        key={subtest.id}
                        className="flex rounded-lg border px-3 py-1 text-sm"
                      >
                        <div className="w-full truncate font-semibold">
                          {subtest.title}
                        </div>
                        <div
                          className={`flex gap-2 ${!subtest.score && "hidden"} `}
                        >
                          <Separator
                            orientation="vertical"
                            className="border"
                          />
                          <div className={`flex min-w-12 justify-center`}>
                            {subtest.correct}/{subtest.all}
                          </div>
                          <Separator
                            orientation="vertical"
                            className="border"
                          />
                          <div
                            className={`flex min-w-12 justify-center rounded-lg border bg-green-500 font-bold`}
                          >
                            {subtest.score}
                          </div>
                        </div>
                      </li>
                    ))}
                  </div>
                </ul>
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  );
}
