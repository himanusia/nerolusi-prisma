"use client";

import { Button } from "~/app/_components/ui/button";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "~/trpc/react";
import { SubtestType } from "@prisma/client";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function DrillPage() {
  const { subtes } = useParams();
  const router = useRouter();
  const session = useSession();

  if (
    Array.isArray(subtes) ||
    !["pu", "ppu", "pbm", "pk", "lb", "pm"].includes(subtes)
  ) {
    return <div>Error: Invalid subtest type</div>;
  }

  const {
    data: packages,
    isLoading,
    isError,
  } = api.quiz.getDrillSubtest.useQuery({ subtes: subtes as SubtestType });

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

      router.push(`/drill/${subtes}/${packageId}/${quizSession.id}`);
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
      <h1>Subtest {subtes}</h1>
      <p>Pilih paket:</p>
      <ul className="flex flex-wrap gap-3">
        {packages.map((pkg) => (
          <li key={pkg.id}>
            <Button
              onClick={() =>
                handleSubtestClick(pkg.id, pkg.duration, pkg.package.id)
              }
            >
              {pkg.package.name}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
