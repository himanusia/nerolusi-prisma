"use client";

import { useEffect, useState } from "react";
import { Button } from "~/app/_components/ui/button";
import { Card, CardContent } from "~/app/_components/ui/card";
import { Badge } from "~/app/_components/ui/badge";
import { api } from "~/trpc/react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Input } from "~/app/_components/ui/input";
import Image from "next/image";
import { useSession } from "next-auth/react";
import ErrorPage from "~/app/error";
import LoadingPage from "~/app/loading";
import Editor from "~/app/_components/editor";
import { Separator } from "~/app/_components/ui/separator";
import {
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Flag,
} from "lucide-react";
import Link from "next/link";

export default function QuizPage() {
  const { sessionId } = useParams(); // drill = subject, subtest = videoId
  const searchParams = useSearchParams();
  const router = useRouter();
  const session = useSession();
  const sessionIdString = Array.isArray(sessionId) ? sessionId[0] : sessionId;

  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Map<number, number[] | string>
  >(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const saveAnswerMutation = api.quiz.saveAnswer.useMutation();
  const submitMutation = api.quiz.submitQuiz.useMutation();
  const updateProgressMutation =
    api.materi.updateUserMaterialProgressAndSubmit.useMutation();

  const {
    data: sessionDetails,
    isLoading,
    isError,
    refetch: refetchSessionDetails,
  } = api.quiz.getSessionDetails.useQuery(
    {
      sessionId: sessionIdString,
    },
    {
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      staleTime: 0, // Always consider data stale
      gcTime: 0, // Don't cache the data
    },
  );

  useEffect(() => {
    if (
      sessionDetails?.endTime &&
      new Date(sessionDetails?.endTime) <= new Date() &&
      (sessionDetails?.score == null || sessionDetails?.score === undefined)
    ) {
      handleSubmit();
    }
  }, [sessionDetails, router, sessionIdString]);

  // Refetch data when page becomes visible again (e.g., when coming back from score page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refetchSessionDetails();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [refetchSessionDetails]);

  const {
    data: questions,
    isLoading: isQuestionsLoading,
    isError: isQuestionsError,
  } = api.quiz.getQuestionsBySubtest.useQuery(
    {
      subtestId: sessionDetails?.subtestId ?? "",
      userId: session.data?.user?.id,
    },
    { enabled: !!sessionDetails },
  );

  // Set timer based on session duration
  useEffect(() => {
    if (sessionDetails?.duration && sessionDetails?.startTime) {
      const startTimestamp = new Date(sessionDetails.startTime).getTime();
      const durationInMs = sessionDetails.duration * 60 * 1000;
      const calculatedEndTime = startTimestamp + durationInMs;

      setEndTime(calculatedEndTime);
      setTimeLeft(Math.max(calculatedEndTime - Date.now(), 0));

      if (sessionDetails.userAnswers) {
        const initialSelectedAnswers = new Map<number, number[] | string>();
        sessionDetails.userAnswers.forEach((ua) => {
          if (ua.essayAnswer !== null) {
            initialSelectedAnswers.set(ua.questionId, ua.essayAnswer);
          } else {
            initialSelectedAnswers.set(
              ua.questionId,
              ua.answerChoices.map((ac) => ac.answerId),
            );
          }
        });
        setSelectedAnswers(initialSelectedAnswers);
      }
    }
  }, [sessionDetails]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(() => Math.max(endTime - Date.now(), 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  // Format time for display
  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Save answer to the backend
  const saveAnswer = async (
    questionId: number,
    answerValue: string | number | number[],
  ) => {
    try {
      await saveAnswerMutation.mutateAsync({
        quizSessionId: sessionIdString,
        questionId,
        userId: sessionDetails?.userId ?? "",
        answerChoices: Array.isArray(answerValue)
          ? answerValue
          : typeof answerValue === "number"
            ? [answerValue]
            : null,
        essayAnswer: typeof answerValue === "string" ? answerValue : null,
      });
    } catch (error) {
      console.error("Failed to save answer:", error);
      toast.error("Failed to save answer. Please try again.");
    }
  };

  // Handle answer selection or essay input
  const handleAnswerChange = (
    questionId: number,
    answerValue: string | number[],
  ) => {
    setSelectedAnswers((prev) => {
      const updatedAnswers = new Map(prev);
      updatedAnswers.set(questionId, answerValue);
      return updatedAnswers;
    });
    saveAnswer(questionId, answerValue);
  };

  // Handle multiple choice answer toggle
  const handleAnswerToggle = (questionId: number, answerId: number) => {
    const currentAnswer = selectedAnswers.get(questionId);
    let newAnswer: number[];

    if (Array.isArray(currentAnswer)) {
      // If it's already an array, toggle the answer
      if (currentAnswer.includes(answerId)) {
        newAnswer = currentAnswer.filter((id) => id !== answerId);
      } else {
        newAnswer = [...currentAnswer, answerId];
      }
    } else {
      // Start with this answer
      newAnswer = [answerId];
    }

    handleAnswerChange(questionId, newAnswer);
  };

  // Handle single choice answer selection (radio button behavior)
  const handleSingleAnswerSelect = (questionId: number, answerId: number) => {
    handleAnswerChange(questionId, [answerId]);
  };

  // Submit all answers
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      for (const [questionId, answerChoice] of selectedAnswers.entries()) {
        await saveAnswer(questionId, answerChoice);
      }

      if (sessionDetails?.subtest.type === "materi") {
        await updateProgressMutation.mutateAsync({
          sessionId: sessionIdString,
          topicId: sessionDetails?.subtest?.topics?.id ?? 0,
          isDrillCompleted: true,
        });
      } else {
        await submitMutation.mutateAsync({
          sessionId: sessionIdString,
        });
      }

      toast.success("Quiz submitted successfully!");

      if (sessionDetails?.subtest.type === "materi") {
        router.push(`/quiz/${sessionIdString}/score`);
      } else {
        router.push(`/tryout/${sessionDetails?.packageId}`);
      }
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      toast.error("Failed to submit quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return isError || isQuestionsError ? (
    <ErrorPage />
  ) : isLoading || isQuestionsLoading ? (
    <LoadingPage />
  ) : (
    <div className="mx-auto max-w-7xl space-y-6 p-4">
      {/* Header with Timer and Progress */}
      <Card className="border-[#2b8057] bg-gradient-to-r from-green-50 to-white">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="mb-2 text-2xl font-bold text-[#2b8057]">
                {(() => {
                  switch (sessionDetails?.subtest.type) {
                    case "pu":
                      return "Kemampuan Penalaran Umum";
                    case "ppu":
                      return "Pengetahuan dan Pemahaman Umum";
                    case "pbm":
                      return "Kemampuan Memahami Bacaan dan Menulis";
                    case "pk":
                      return "Pengetahuan Kuantitatif";
                    case "pm":
                      return "Penalaran Matematika";
                    case "lbe":
                      return "Literasi Bahasa Inggris";
                    case "lbi":
                      return "Literasi Bahasa Indonesia";
                    case "matematika_wajib":
                      return "Matematika Wajib";
                    case "bahasa_indonesia":
                      return "Bahasa Indonesia";
                    case "bahasa_inggris":
                      return "Bahasa Inggris";
                    case "matematika_lanjut":
                      return "Matematika Lanjut";
                    case "fisika":
                      return "Fisika";
                    case "kimia":
                      return "Kimia";
                    case "biologi":
                      return "Biologi";
                    case "ekonomi":
                      return "Ekonomi";
                    case "geografi":
                      return "Geografi";
                    case "sejarah":
                      return "Sejarah";
                    case "ppkn":
                      return "PPKn";
                    case "projek_kreatif_kewirausahaan":
                      return "Projek Kreatif Kewirausahaan";
                    default:
                      return "";
                  }
                })()}
              </h1>
              <p className="text-gray-600">
                Soal {currentQuestionIndex + 1} dari {questions?.length || 0}
              </p>
            </div>

            {/* Timer */}
            {timeLeft > 0 && new Date(sessionDetails?.endTime) > new Date() && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2">
                  <Clock className="h-5 w-5 text-[#2b8057]" />
                  <span className="font-mono text-lg font-bold text-[#2b8057]">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Simple Progress Bar */}
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-600">Progress</span>
              <span className="text-sm font-medium text-[#2b8057]">
                {selectedAnswers.size}/{questions?.length || 0} dijawab
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-[#2b8057] transition-all duration-300"
                style={{
                  width: `${(selectedAnswers.size / (questions?.length || 1)) * 100}%`,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Main Question Area */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6">
              {questions && questions[currentQuestionIndex] && (
                <div className="space-y-6">
                  {/* Question Header */}
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className="border-[#2b8057] text-[#2b8057]"
                    >
                      Soal {currentQuestionIndex + 1}
                    </Badge>
                    {/* {(session.data?.user.role === "teacher" ||
                      session.data?.user.role === "admin") &&
                      drill === "soal" &&
                      new Date(sessionDetails?.endTime) < new Date() && (
                        <Badge variant="secondary">
                          Skor:{" "}
                          {questions[currentQuestionIndex].type === "essay"
                            ? selectedAnswers
                                .get(questions[currentQuestionIndex].id)
                                ?.toString()
                                .trim() ===
                              questions[
                                currentQuestionIndex
                              ].answers[0].content.trim()
                              ? questions[currentQuestionIndex].score
                              : 0
                            : (() => {
                                const userAnswer = selectedAnswers.get(
                                  questions[currentQuestionIndex].id,
                                );
                                const selectedAnswerIds = Array.isArray(
                                  userAnswer,
                                )
                                  ? userAnswer
                                  : typeof userAnswer === "number"
                                    ? [userAnswer]
                                    : [];
                                const correctAnswerIds = questions[
                                  currentQuestionIndex
                                ].answers
                                  .filter((answer) => answer.isCorrect)
                                  .map((answer) => answer.id);

                                // Check if user selected exactly the correct answers
                                const isCorrect =
                                  selectedAnswerIds.length ===
                                    correctAnswerIds.length &&
                                  selectedAnswerIds.every((id) =>
                                    correctAnswerIds.includes(id),
                                  );

                                return isCorrect
                                  ? questions[currentQuestionIndex].score
                                  : 0;
                              })()}
                        </Badge>
                      )} */}
                  </div>

                  {/* Question Content */}
                  <div className="rounded-lg bg-gray-50 p-4">
                    <Editor
                      key={questions[currentQuestionIndex].id}
                      content={questions[currentQuestionIndex].content}
                      className="border-none"
                    />
                    {/* <div className="whitespace-pre-line text-base">
                      {questions[currentQuestionIndex].content}
                    </div> */}
                    {questions[currentQuestionIndex].imageUrl && (
                      <Image
                        src={questions[currentQuestionIndex].imageUrl}
                        alt="Question Image"
                        width={400}
                        height={300}
                        className="mt-4 max-h-[50vh] w-auto rounded-lg"
                      />
                    )}
                  </div>

                  {/* Answer Options */}
                  <div className="space-y-3">
                    {questions[currentQuestionIndex].type === "essay" ? (
                      <div className="space-y-4">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Jawaban Anda:
                          </label>
                          <textarea
                            rows={4}
                            className="w-full rounded-lg border p-3"
                            placeholder="Tulis jawaban Anda di sini..."
                            value={
                              typeof selectedAnswers.get(
                                questions[currentQuestionIndex].id,
                              ) === "string"
                                ? (selectedAnswers.get(
                                    questions[currentQuestionIndex].id,
                                  ) as string)
                                : ""
                            }
                            onChange={(e) =>
                              handleAnswerChange(
                                questions[currentQuestionIndex].id,
                                e.target.value,
                              )
                            }
                            disabled={
                              new Date(sessionDetails.endTime) < new Date() &&
                              session.data?.user?.role === "user"
                            }
                          />
                        </div>

                        {/* Show correct answer after quiz ends */}
                        {new Date(sessionDetails?.endTime) < new Date() &&
                          questions[currentQuestionIndex].answers[0] && (
                            <>
                              {/* User's Answer */}
                              {(() => {
                                const userAnswer = selectedAnswers.get(
                                  questions[currentQuestionIndex].id,
                                );
                                const userAnswerText =
                                  typeof userAnswer === "string"
                                    ? userAnswer
                                    : "";
                                const correctAnswer =
                                  questions[currentQuestionIndex].answers[0]
                                    .content;
                                const isCorrect =
                                  userAnswerText.trim().toLowerCase() ===
                                  correctAnswer.trim().toLowerCase();

                                return (
                                  <div
                                    className={`rounded-lg border p-4 ${
                                      isCorrect
                                        ? "border-green-200 bg-green-50"
                                        : "border-red-200 bg-red-50"
                                    }`}
                                  >
                                    <label
                                      className={`mb-2 block text-sm font-medium ${
                                        isCorrect
                                          ? "text-green-800"
                                          : "text-red-800"
                                      }`}
                                    >
                                      Jawaban Anda:{" "}
                                      {isCorrect ? "(Benar)" : "(Salah)"}
                                    </label>
                                    <div className="rounded-lg bg-white p-3 text-gray-900">
                                      {userAnswerText || "Tidak dijawab"}
                                    </div>
                                  </div>
                                );
                              })()}

                              {/* Correct Answer */}
                              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                <label className="mb-2 block text-sm font-medium text-green-800">
                                  Jawaban Benar:
                                </label>
                                <div className="rounded-lg bg-white p-3 text-gray-900">
                                  <Editor
                                    key={
                                      questions[currentQuestionIndex].id
                                    }
                                    content={
                                      questions[currentQuestionIndex].answers[0]
                                        .content
                                    }
                                    className="border-none"
                                  />
                                </div>
                              </div>
                            </>
                          )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {(() => {
                          // Determine if this question allows multiple answers
                          const isMultipleAnswer =
                            questions[currentQuestionIndex].type ===
                            "mulAnswer";

                          const userAnswer = selectedAnswers.get(
                            questions[currentQuestionIndex].id,
                          );
                          return questions[currentQuestionIndex].answers.map(
                            (answer) => {
                              const isSelected = Array.isArray(userAnswer)
                                ? userAnswer.includes(answer.id)
                                : typeof userAnswer === "number" &&
                                  userAnswer === answer.id;
                              const isCorrect =
                                new Date(sessionDetails.endTime) < new Date() &&
                                answer.isCorrect;
                              const isWrong =
                                (new Date(sessionDetails.endTime) <
                                  new Date() &&
                                  isSelected &&
                                  !answer.isCorrect) ||
                                (!isSelected && answer.isCorrect);

                              return (
                                <label
                                  key={answer.id}
                                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                                    isCorrect
                                      ? isSelected
                                        ? "border-green-200 bg-green-50"
                                        : isWrong
                                          ? "border-red-200 bg-red-50"
                                          : "border-gray-200 bg-gray-50"
                                      : isSelected
                                        ? isWrong
                                          ? "border-red-200 bg-red-50"
                                          : "border-gray-200 hover:bg-gray-50"
                                        : "border-gray-200 hover:bg-gray-50"
                                  } ${
                                    !(
                                      new Date(sessionDetails.endTime) <
                                        new Date() &&
                                      session.data?.user?.role === "user"
                                    )
                                      ? "hover:border-[#2b8057]"
                                      : ""
                                  }`}
                                >
                                  <Input
                                    type={
                                      isMultipleAnswer ? "checkbox" : "radio"
                                    }
                                    disabled={
                                      new Date(sessionDetails.endTime) <
                                        new Date() &&
                                      session.data?.user?.role === "user"
                                    }
                                    name={
                                      isMultipleAnswer
                                        ? `question-${questions[currentQuestionIndex].id}-answer-${answer.id}`
                                        : `question-${questions[currentQuestionIndex].id}`
                                    }
                                    value={answer.id}
                                    className="sr-only"
                                    checked={isSelected}
                                    onChange={() =>
                                      isMultipleAnswer
                                        ? handleAnswerToggle(
                                            questions[currentQuestionIndex].id,
                                            answer.id,
                                          )
                                        : handleSingleAnswerSelect(
                                            questions[currentQuestionIndex].id,
                                            answer.id,
                                          )
                                    }
                                  />
                                  <div
                                    className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center ${
                                      isMultipleAnswer
                                        ? "rounded"
                                        : "rounded-full"
                                    } border-2 ${
                                      isSelected
                                        ? isCorrect
                                          ? "border-green-500 bg-green-500"
                                          : isWrong
                                            ? "border-red-500 bg-red-500"
                                            : "border-[#2b8057] bg-[#2b8057]"
                                        : "border-gray-300 bg-white"
                                    }`}
                                  >
                                    {isSelected &&
                                      (isMultipleAnswer ? (
                                        <CheckCircle
                                          className={`h-4 w-4 ${
                                            isCorrect || isWrong
                                              ? "text-white"
                                              : "text-white"
                                          }`}
                                        />
                                      ) : (
                                        <div
                                          className={`h-2 w-2 rounded-full ${
                                            isCorrect || isWrong
                                              ? "bg-white"
                                              : "bg-white"
                                          }`}
                                        />
                                      ))}
                                  </div>
                                  <div className="flex-1">
                                    <div className="mb-1 flex items-center gap-2">
                                      <span className={`font-medium`}>
                                        {String.fromCharCode(65 + answer.index)}
                                        .
                                      </span>
                                      {isCorrect && (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                      )}
                                    </div>
                                    <div className="flex px-3 py-4 border rounded-lg border-gray-200">
                                      {answer.content}
                                    </div>
                                    {/* <Editor content={answer.content} /> */}
                                  </div>
                                </label>
                              );
                            },
                          );
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Explanation (shown after session ends) */}
                  {new Date(sessionDetails?.endTime) < new Date() &&
                    questions[currentQuestionIndex].explanation && (
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <h4 className="mb-2 font-semibold text-blue-900">
                          Penjelasan:
                        </h4>
                        <Editor
                          key={questions[currentQuestionIndex].id}
                          content={questions[currentQuestionIndex].explanation}
                        />
                        {/* <div className="whitespace-pre-line">
                          {questions[currentQuestionIndex].explanation}
                        </div> */}
                      </div>
                    )}

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentQuestionIndex(
                          Math.max(0, currentQuestionIndex - 1),
                        )
                      }
                      disabled={currentQuestionIndex === 0}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Sebelumnya
                    </Button>

                    <Button
                      onClick={() =>
                        setCurrentQuestionIndex(
                          Math.min(
                            (questions?.length || 1) - 1,
                            currentQuestionIndex + 1,
                          ),
                        )
                      }
                      disabled={
                        currentQuestionIndex === (questions?.length || 1) - 1
                      }
                      className="flex items-center gap-2 bg-[#2b8057] text-white hover:bg-[#1f5a40]"
                    >
                      Selanjutnya
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Question Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 font-semibold text-gray-900">
                Navigasi Soal
              </h3>

              {/* Question Grid */}
              <div className="mb-6 grid grid-cols-5 gap-2 lg:grid-cols-4">
                {questions?.map((_, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className={`aspect-square text-xs ${
                      index === currentQuestionIndex
                        ? "border-[#2b8057] bg-[#2b8057] text-white"
                        : selectedAnswers.has(questions[index].id)
                          ? "border-green-300 bg-green-100 text-green-800"
                          : "hover:border-[#2b8057]"
                    }`}
                    onClick={() => setCurrentQuestionIndex(index)}
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>

              {/* Submit Button */}
              {new Date(sessionDetails?.endTime) >= new Date() &&
              session.data?.user.role === "user" ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex w-full items-center gap-2 bg-red-600 text-white hover:bg-red-700"
                >
                  <Flag className="h-4 w-4" />
                  {isSubmitting ? "Mengirim..." : "Selesai & Kirim"}
                </Button>
              ) : (
                <Link href={`/quiz/${sessionIdString}/score`}>
                  <Button className="flex w-full gap-2">
                    <Flag className="h-4 w-4" />
                    Lihat Hasil
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
