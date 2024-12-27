"use client";

import { Button } from "~/app/_components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { SubtestType } from "@prisma/client";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function DrillPage() {
  const { subtest } = useParams();
  const router = useRouter();
  const session = useSession();

  const {
    data: packages,
    isLoading,
    isError,
  } = api.quiz.getDrillSubtest.useQuery({ subtest: subtest as SubtestType });

  const startSessionMutation = api.quiz.createSession.useMutation();
  const getSessionMutation = api.quiz.getSession.useMutation();

  async function handleSubtestClick(
    subtestId: number,
    duration: number,
    packageId: number,
  ) {
    if (!session.data || !session.data.user) {
      toast.error("Anda harus login terlebih dahulu");
      return;
    }

    const userId = session.data.user.id;

    try {
      let quizSession;

      quizSession = await getSessionMutation.mutateAsync({
        userId,
        subtestId,
      });

      if (!quizSession) {
        quizSession = await startSessionMutation.mutateAsync({
          userId,
          packageId,
          subtestId,
          duration: duration ?? 10000,
        });
      }

      router.push(`/drill/${subtest}/${packageId}/${quizSession.id}`);
    } catch (error) {
      console.error(error);
      toast.error("Error creating session", {
        description: error.message,
      });
    }
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error fetching packages.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <h1>
        Drill {""}
        {(() => {
          switch (subtest) {
            case "pu":
              return "Kemampuan Penalaran Umum";
            case "ppu":
              return "Pengetahuan dan Pemahaman Umum";
            case "pbm":
              return "Kemampuan Memahami Bacaan dan Menulis";
            case "pk":
              return "Pengetahuan Kuantitatif";
            case "lb":
              return "Literasi Bahasa Indonesia dan Bahasa Inggris";
            case "pm":
              return "Penalaran Matematika";
            default:
              return subtest;
          }
        })()}
      </h1>
      <p>Pilih paket:</p>
      <div className="gap- flex flex-col rounded-lg border">
        {packages.map((pkg) => (
          <Button
            key={pkg.id}
            className="rounded-none border-b"
            variant="ghost"
            onClick={() =>
              handleSubtestClick(pkg.id, pkg.duration, pkg.package.id)
            }
          >
            {pkg.package.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
