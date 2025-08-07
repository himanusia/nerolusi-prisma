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
import { Clock, CheckCircle, ChevronLeft, ChevronRight, Flag } from "lucide-react";

export default function QuizPage() {
  const { drill, subtest, packageId, sessionId } = useParams(); // drill = subject, subtest = videoId
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const router = useRouter();
  const session = useSession();
  const sessionIdString = Array.isArray(sessionId) ? sessionId[0] : sessionId;

  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Map<number, number | string>
  >(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const saveAnswerMutation = api.quiz.saveAnswer.useMutation();
  const submitMutation = api.quiz.submitQuiz.useMutation();

  const {
    data: sessionDetails,
    isLoading,
    isError,
  } = api.quiz.getSessionDetails.useQuery({
    sessionId: parseInt(sessionIdString),
  });

  useEffect(() => {
    if (
      sessionDetails?.endTime &&
      new Date(sessionDetails?.endTime) === new Date()
    ) {
      router.push(`/drill/${drill}/${subtest}/score`);
    }
  }, [sessionDetails, router, packageId]);

  const {
    data: questions,
    isLoading: isQuestionsLoading,
    isError: isQuestionsError,
  } = api.quiz.getQuestionsBySubtest.useQuery(
    {
      subtestId: sessionDetails?.subtestId ?? 0,
      userId: userId ?? session.data?.user?.id,
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
        const initialSelectedAnswers = new Map<number, number | string>();
        sessionDetails.userAnswers.forEach((ua) => {
          if (ua.essayAnswer !== null) {
            initialSelectedAnswers.set(ua.questionId, ua.essayAnswer);
          } else {
            initialSelectedAnswers.set(ua.questionId, ua.answerChoice);
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
    answerValue: string | number,
  ) => {
    try {
      await saveAnswerMutation.mutateAsync({
        quizSessionId: parseInt(sessionIdString),
        questionId,
        packageId: sessionDetails?.packageId ?? 0,
        userId:
          drill === "soal" &&
          (session.data.user.role === "admin" ||
            session.data.user.role === "teacher")
            ? userId
            : (sessionDetails?.userId ?? ""),
        answerChoice: typeof answerValue === "number" ? answerValue : null,
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
    answerValue: string | number,
  ) => {
    setSelectedAnswers((prev) => {
      const updatedAnswers = new Map(prev);
      updatedAnswers.set(questionId, answerValue);
      saveAnswer(questionId, answerValue);
      return updatedAnswers;
    });
  };

  // Submit all answers
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      for (const [questionId, answerChoice] of selectedAnswers.entries()) {
        await saveAnswer(questionId, answerChoice);
      }
      await submitMutation.mutateAsync({
        sessionId: parseInt(sessionIdString),
      });
      toast.success("Quiz submitted successfully!");
      // Redirect to drill score page after completion
      router.push(`/drill/${drill}/${subtest}/score`);
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
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header with Timer and Progress */}
      <Card className="border-[#2b8057] bg-gradient-to-r from-green-50 to-white">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#2b8057] mb-2">
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
                    default:
                      return sessionDetails?.subtest.type;
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
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border">
                  <Clock className="w-5 h-5 text-[#2b8057]" />
                  <span className="font-mono text-lg font-bold text-[#2b8057]">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Simple Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Progress</span>
              <span className="text-sm font-medium text-[#2b8057]">
                {selectedAnswers.size}/{questions?.length || 0} dijawab
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#2b8057] h-2 rounded-full transition-all duration-300"
                style={{ width: `${((selectedAnswers.size) / (questions?.length || 1)) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Question Area */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6">
              {questions && questions[currentQuestionIndex] && (
                <div className="space-y-6">
                  {/* Question Header */}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[#2b8057] border-[#2b8057]">
                      Soal {currentQuestionIndex + 1}
                    </Badge>
                    {(session.data?.user.role === "teacher" ||
                      session.data?.user.role === "admin") &&
                      drill === "soal" &&
                      new Date(sessionDetails?.endTime) < new Date() && (
                        <Badge variant="secondary">
                          Skor: {questions[currentQuestionIndex].type === "essay"
                            ? selectedAnswers
                                .get(questions[currentQuestionIndex].id)
                                ?.toString()
                                .trim() ===
                              questions[currentQuestionIndex].answers[0].content.trim()
                              ? questions[currentQuestionIndex].score
                              : 0
                            : selectedAnswers.get(questions[currentQuestionIndex].id) ===
                                questions[currentQuestionIndex].correctAnswerChoice
                            ? questions[currentQuestionIndex].score
                            : 0}
                        </Badge>
                      )}
                  </div>

                  {/* Question Content */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <Editor
                      content={questions[currentQuestionIndex].content}
                      className="border-none"
                    />
                    {questions[currentQuestionIndex].imageUrl && (
                      <Image
                        src={questions[currentQuestionIndex].imageUrl}
                        alt="Question Image"
                        width={400}
                        height={300}
                        className="mt-4 rounded-lg max-h-[50vh] w-auto"
                      />
                    )}
                  </div>

                  {/* Answer Options */}
                  <div className="space-y-3">
                    {questions[currentQuestionIndex].type === "essay" ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Jawaban Anda:
                        </label>
                        <textarea
                          rows={4}
                          className="w-full p-3 border rounded-lg"
                          placeholder="Tulis jawaban Anda di sini..."
                          value={
                            selectedAnswers.get(questions[currentQuestionIndex].id) || ""
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
                    ) : (
                      <div className="space-y-2">
                        {questions[currentQuestionIndex].answers.map((answer) => {
                          const isSelected = selectedAnswers.get(questions[currentQuestionIndex].id) === answer.index;
                          const isCorrect = new Date(sessionDetails.endTime) < new Date() && 
                                          questions[currentQuestionIndex].correctAnswerChoice === answer.index;
                          const isWrong = new Date(sessionDetails.endTime) < new Date() && 
                                        isSelected && 
                                        questions[currentQuestionIndex].correctAnswerChoice !== answer.index;

                          return (
                            <label
                              key={answer.index}
                              className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                                isCorrect
                                  ? "bg-green-50 border-green-200"
                                  : isWrong
                                  ? "bg-red-50 border-red-200"
                                  : isSelected
                                  ? "bg-[#2b8057] text-white border-[#2b8057]"
                                  : "hover:bg-gray-50 border-gray-200"
                              } ${
                                !(new Date(sessionDetails.endTime) < new Date() && 
                                  session.data?.user?.role === "user") 
                                  ? "hover:border-[#2b8057]" 
                                  : ""
                              }`}
                            >
                              <Input
                                type="radio"
                                disabled={
                                  new Date(sessionDetails.endTime) < new Date() &&
                                  session.data?.user?.role === "user"
                                }
                                name={`question-${questions[currentQuestionIndex].id}`}
                                value={answer.index}
                                className="sr-only"
                                checked={isSelected}
                                onChange={() =>
                                  handleAnswerChange(
                                    questions[currentQuestionIndex].id,
                                    answer.index,
                                  )
                                }
                              />
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                isSelected
                                  ? isCorrect
                                    ? "bg-green-500 border-green-500"
                                    : isWrong
                                    ? "bg-red-500 border-red-500"
                                    : "bg-white border-[#2b8057]"
                                  : "border-gray-300"
                              }`}>
                                {isSelected && (
                                  <div className={`w-2 h-2 rounded-full ${
                                    isCorrect || isWrong ? "bg-white" : "bg-[#2b8057]"
                                  }`} />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`font-medium ${isSelected && !isCorrect && !isWrong ? "text-white" : ""}`}>
                                    {String.fromCharCode(65 + answer.index)}.
                                  </span>
                                  {isCorrect && <CheckCircle className="w-4 h-4 text-green-600" />}
                                </div>
                                <Editor content={answer.content} />
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Explanation (shown after session ends) */}
                  {new Date(sessionDetails?.endTime) < new Date() && 
                   questions[currentQuestionIndex].explanation && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">Penjelasan:</h4>
                      <Editor content={questions[currentQuestionIndex].explanation} />
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                      disabled={currentQuestionIndex === 0}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Sebelumnya
                    </Button>
                    
                    <Button
                      onClick={() => setCurrentQuestionIndex(Math.min((questions?.length || 1) - 1, currentQuestionIndex + 1))}
                      disabled={currentQuestionIndex === (questions?.length || 1) - 1}
                      className="flex items-center gap-2 bg-[#2b8057] hover:bg-[#1f5a40] text-white"
                    >
                      Selanjutnya
                      <ChevronRight className="w-4 h-4" />
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
              <h3 className="font-semibold text-gray-900 mb-4">Navigasi Soal</h3>
              
              {/* Question Grid */}
              <div className="grid grid-cols-5 lg:grid-cols-4 gap-2 mb-6">
                {questions?.map((_, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className={`aspect-square text-xs ${
                      index === currentQuestionIndex
                        ? "bg-[#2b8057] text-white border-[#2b8057]"
                        : selectedAnswers.has(questions[index].id)
                        ? "bg-green-100 text-green-800 border-green-300"
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
               session.data?.user.role === "user" && (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                >
                  <Flag className="w-4 h-4" />
                  {isSubmitting ? "Mengirim..." : "Selesai & Kirim"}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
