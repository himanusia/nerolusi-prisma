"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getSubjectByName,
} from "~/app/_components/constants";
import { Button } from "~/app/_components/ui/button";
import { Card, CardContent } from "~/app/_components/ui/card";
import ErrorPage from "~/app/error";
import LoadingPage from "~/app/loading";
import { api } from "~/trpc/react";

export default function ScorePage() {
  const { sessionId } = useParams();
  const router = useRouter();
  const [scorePercantage, setScorePercantage] = useState(0);
  const [subjectSlug, setSubjectSlug] = useState("");
  const [completedAt, setCompletedAt] = useState("");

  const sessionIdString = Array.isArray(sessionId)
    ? sessionId[0]
    : (sessionId ?? "");

  const {
    data: quizResult,
    isLoading,
    isError,
  } = api.quiz.getQuizSessionResult.useQuery({
    sessionId: sessionIdString,
  });

  useEffect(() => {
    if (
      !isLoading &&
      !isError &&
      (!quizResult ||
        quizResult?.score === undefined ||
        quizResult?.score === null)
    ) {
      router.push(`/quiz/${sessionIdString}/`);
    }
  }, [quizResult, isLoading, isError, router, sessionIdString]);

  useEffect(() => {
    if (!isLoading && !isError) {
      setScorePercantage(
        Math.round((quizResult.numCorrect / quizResult.numQuestion) * 100),
      );
      setSubjectSlug(
        getSubjectByName(quizResult.subtest.topics.material.subject.name)
          ?.slug || "",
      );
      setCompletedAt(
        new Date(quizResult.endTime).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    }
  }, [quizResult, isLoading, isError, router, sessionIdString]);
  if (isLoading) {
    return <LoadingPage />;
  }

  if (isError) {
    return <ErrorPage />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-[#2b8057]">
          Hasil Drill: {quizResult.subtest.topics.name}
        </h1>
        <h2 className="mb-4 text-xl text-gray-700">
          {quizResult.subtest.topics.video.title}
        </h2>
        <p className="text-gray-600">
          Berikut adalah hasil drill soal yang telah Anda kerjakan
        </p>
      </div>

      {/* Score Card */}
      <Card className="border-[#2b8057]">
        <CardContent className="p-8">
          <div className="mb-6 text-center">
            <div
              className={`mb-2 text-6xl font-bold ${
                scorePercantage >= 80
                  ? "text-green-500"
                  : scorePercantage >= 60
                    ? "text-yellow-500"
                    : "text-red-500"
              }`}
            >
              {scorePercantage}%
            </div>
            <p className="text-gray-600">Skor Anda</p>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-1 text-2xl font-bold text-[#2b8057]">
                {quizResult.numQuestion}
              </div>
              <p className="text-sm text-gray-600">Total Soal</p>
            </div>
            <div className="text-center">
              <div className="mb-1 text-2xl font-bold text-green-500">
                {quizResult.numCorrect}
              </div>
              <p className="text-sm text-gray-600">Jawaban Benar</p>
            </div>
            <div className="text-center">
              <div className="mb-1 text-2xl font-bold text-red-500">
                {quizResult.numQuestion - quizResult.numCorrect}
              </div>
              <p className="text-sm text-gray-600">Jawaban Salah</p>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500">
            Diselesaikan pada: {completedAt}
          </div>
        </CardContent>
      </Card>

      {/* Performance Analysis */}
      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Analisis Performa
          </h3>

          <div className="space-y-3">
            {scorePercantage >= 80 && (
              <div className="flex items-center gap-3 rounded-lg bg-green-50 p-3">
                <div className="text-xl text-green-500">🎉</div>
                <div>
                  <p className="font-medium text-green-800">Excellent!</p>
                  <p className="text-sm text-green-600">
                    Anda telah menguasai materi {quizResult.subtest.topics.name}{" "}
                    dengan sangat baik!
                  </p>
                </div>
              </div>
            )}

            {scorePercantage >= 60 && scorePercantage < 80 && (
              <div className="flex items-center gap-3 rounded-lg bg-yellow-50 p-3">
                <div className="text-xl text-yellow-500">👍</div>
                <div>
                  <p className="font-medium text-yellow-800">Good Job!</p>
                  <p className="text-sm text-yellow-600">
                    Pemahaman Anda cukup baik, terus tingkatkan lagi!
                  </p>
                </div>
              </div>
            )}

            {scorePercantage < 60 && (
              <div className="flex items-center gap-3 rounded-lg bg-red-50 p-3">
                <div className="text-xl text-red-500">💪</div>
                <div>
                  <p className="font-medium text-red-800">Keep Trying!</p>
                  <p className="text-sm text-red-600">
                    Jangan menyerah! Ulangi video dan coba drill lagi.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col justify-center gap-4 sm:flex-row">
        <Link href={`/quiz/${sessionIdString}`}>
          <Button className="bg-[#2b8057] text-white hover:bg-[#1f5a40]">
            🔄 Review Drill
          </Button>
        </Link>

        <Link href={`/video/materi/${subjectSlug}`}>
          <Button
            variant="outline"
            className="border-[#2b8057] text-[#2b8057] hover:bg-[#2b8057] hover:text-white"
          >
            📚 Kembali ke Materi
          </Button>
        </Link>

        <Link href={`/video/${quizResult.subtest.topics.videoId}`}>
          <Button
            variant="outline"
            className="border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            📺 Tonton Ulang Video
          </Button>
        </Link>
      </div>
    </div>
  );
}
