"use client";

import { QuizSession } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "~/app/_components/ui/button";
import { api } from "~/trpc/react";

export default function QuizPage() {
  const { paket } = useParams();
  const startSessionMutation = api.quiz.createSession.useMutation();
  const getSessionMutation = api.quiz.getSession.useMutation();
  const router = useRouter();
  const session = useSession();

  const {
    data: packageData,
    isLoading,
    isError,
  } = api.quiz.getPackageWithSubtest.useQuery({ id: Number(paket) });

  if (isLoading) return <div>Loading subtests...</div>;
  if (isError) return <div>Failed to load subtests</div>;

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4">
      <div className="flex flex-col items-center gap-2 border-b p-4">
        <h1 className="mb-4 text-xl font-bold">{packageData.name}</h1>
        <p>Start Time: {new Date(packageData.TOstart).toLocaleString()}</p>
        <p>End Time: {new Date(packageData.TOend).toLocaleString()}</p>
      </div>
      <div className="flex flex-wrap gap-4">
        {packageData.subtests?.map((subtest) => (
          <Button
            key={subtest.id}
            onClick={() => handleSubtestClick(subtest.id, subtest.duration)}
            variant="outline"
            className={`w-full ${subtest.quizSession[0] && "bg-green-600 hover:bg-green-700"}`}
            disabled={
              new Date(subtest.quizSession[0]?.endTime) < new Date() &&
              new Date(packageData.TOend) >= new Date()
            }
          >
            {(() => {
              switch (subtest.type) {
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
                  return subtest.type;
              }
            })()}
          </Button>
        ))}
      </div>
    </div>
  );

  async function handleSubtestClick(subtestId: number, duration: number) {
    if (!session.data || !session.data.user) {
      toast.error("Anda harus login terlebih dahulu");
      return;
    }

    const userId = session.data.user.id;
    const packageId = Number(paket);

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

      router.push(`/tryout/${paket}/${quizSession.id}`);
    } catch (error) {
      console.error(error);
      toast.error("Error creating session", {
        description: error.message,
      });
    }
  }
}
