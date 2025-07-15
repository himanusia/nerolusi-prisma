"use client";

import { useEffect, useState } from "react";
import { Button } from "~/app/_components/ui/button";
import { api } from "~/trpc/react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Input } from "~/app/_components/ui/input";
import Image from "next/image";
import { useSession } from "next-auth/react";
import ErrorPage from "~/app/error";
import LoadingPage from "~/app/loading";
import Editor from "~/app/_components/editor";

export default function QuizPage() {
  const { packageId, sessionId } = useParams();
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
  const [doubtfulQuestions, setDoubtfulQuestions] = useState<Set<number>>(new Set());
  const [fontSize, setFontSize] = useState<"text-sm" | "text-base" | "text-lg">("text-base");

  const saveAnswerMutation = api.quiz.saveAnswer.useMutation();
  const submitMutation = api.quiz.submitQuiz.useMutation();

  const {
    data: sessionDetails,
    isLoading,
    isError,
  } = api.quiz.getSessionDetails.useQuery({
    sessionId: parseInt(sessionIdString),
  });

  const {
    data: packageData,
    isLoading: isPackageLoading,
    isError: isPackageError,
  } = api.quiz.getPackageWithSubtest.useQuery(
    { id: parseInt(packageId as string) },
    { enabled: !!packageId },
  );

  const {
    data: questions,
    isLoading: isQuestionsLoading,
    isError: isQuestionsError,
  } = api.quiz.getQuestionsBySubtest.useQuery(
    { subtestId: sessionDetails?.subtestId ?? 0 },
    { enabled: !!sessionDetails },
  );

  useEffect(() => {
    if (sessionDetails?.duration && sessionDetails?.startTime) {
      const startTimestamp = new Date(sessionDetails.startTime).getTime();
      const durationInMs = sessionDetails.duration * 60 * 1000;
      const calculatedEndTime = Math.min(
        startTimestamp + durationInMs,
        new Date(sessionDetails.endTime).getTime(),
      );

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
        userId: sessionDetails?.userId ?? "",
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

  const handleDoubtfulToggle = (questionId: number) => {
    setDoubtfulQuestions((prev) => {
      const updated = new Set(prev);
      if (updated.has(questionId)) {
        updated.delete(questionId);
      } else {
        updated.add(questionId);
      }
      return updated;
    });
  };

  const getQuestionButtonStyle = (index: number) => {
    const questionId = questions?.[index]?.id;
    const isAnswered = selectedAnswers.has(questionId);
    const isDoubtful = doubtfulQuestions.has(questionId);
    const isCurrent = currentQuestionIndex === index;
    
    if (canViewReview && questions?.[index]) {
      const userAnswer = selectedAnswers.get(questionId);
      const correctAnswer = questions[index].correctAnswerChoice;
      
      if (userAnswer === correctAnswer) {
        // Correct answer
        return "bg-[#2b8057] text-white hover:bg-[#2b8057]/80 hover:text-white !border !border-[#2b8057]";
      } else if (isAnswered) {
        // Wrong answer
        return "bg-[#ff0000] text-black hover:bg-[#ff0000]/80 hover:text-black !border !border-[#ff0000]";
      } else {
        // Not answered
        return "bg-[#ff0000] text-black hover:bg-[#ff0000]/80 hover:text-black !border !border-[#ff0000]";
      }
    }
    
    // Regular mode
    if (isCurrent) {
      return "bg-gray-400 text-black hover:bg-gray-400/80 hover:text-black !border !border-[#acaeba]"; // Current question
    } else if (isDoubtful) {
      return "bg-[#ffde59] text-black hover:bg-[#ffde59]/80 hover:text-black !border !border-[#acaeba]"; // Doubtful
    } else if (isAnswered) {
      return "bg-[#2b8057] text-white hover:bg-[#2b8057]/80 hover:text-white !border !border-[#2b8057]"; // Answered
    } else {
      return "bg-white text-black !border !border-[#acaeba] hover:bg-gray-100 hover:text-black"; // Unanswered
    }
  };

  const isSessionCompleted = sessionDetails?.endTime && new Date(sessionDetails.endTime) < new Date();
  const isPackageEndDatePassed = packageData?.TOend && new Date(packageData.TOend) < new Date();
  const canViewReview = isSessionCompleted && isPackageEndDatePassed;

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
      router.push(`/tryout/${packageId}`);
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      toast.error("Failed to submit quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return isError || isQuestionsError || isPackageError ? (
    <ErrorPage />
  ) : isLoading || isQuestionsLoading || isPackageLoading ? (
    <LoadingPage />
  ) : (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#2b8057]">
      {/* mobile version */}
      <div className="lg:hidden bg-white p-4 flex items-center justify-between">
        {/* <Button 
          variant="outline" 
          onClick={() => router.push(`/tryout/${packageId}`)}
          className="text-sm"
        >
          ← Kembali
        </Button> */}
        <p className="font-bold text-lg text-center">
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
        </p>
        <div className="text-left">
          <p className="text-md font-bold">Waktu:</p>
          <p className="text-xl font-bold rounded-md border border-[#acaeba] p-2">
            {timeLeft <= 0 ? "--:--" : formatTime(timeLeft)}
          </p>
        </div>
      </div>

      <div className="lg:hidden bg-white p-2 -mt-2">
        <div className="overflow-x-auto scrollbar-hide mb-2">
          <div className="flex gap-2 pb-2" style={{ minWidth: 'max-content' }}>
            {questions?.map((_, index) => (
              <Button
                key={index}
                className={`flex-shrink-0 w-10 h-10 text-sm ${getQuestionButtonStyle(index)}`}
                style={{ border: "1px solid" }}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-b border-[#acaeba] py-2">
          <span className="font-bold text-sm">Ukuran:</span>
          <Button
            variant={fontSize === "text-lg" ? "default" : "outline"}
            size="sm"
            className="text-lg font-bold text-black"
            onClick={() => setFontSize("text-lg")}
          >
            Aa
          </Button>
          <Button
            variant={fontSize === "text-base" ? "default" : "outline"}
            size="sm"
            className="text-base font-bold text-black"
            onClick={() => setFontSize("text-base")}
          >
            Aa
          </Button>
          <Button
            variant={fontSize === "text-sm" ? "default" : "outline"}
            size="sm"
            className="text-sm font-bold text-black"
            onClick={() => setFontSize("text-sm")}
          >
            Aa
          </Button>
        </div>
      </div>

      {/* Left Panel */}
      <div className="hidden lg:block w-1/3 px-10 py-5 bg-white border-[1px] border-[#acaeba]">
        <Button 
          variant="outline" 
          onClick={() => router.push(`/tryout/${packageId}`)}
          className="mb-5"
        >
          ← Kembali
        </Button>

        <div className="text-center mb-5">
          <h3 className="font-bold text-lg">
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
          </h3>
        </div>

        {/* Question Navigation Grid */}
        <div className="grid grid-cols-6 gap-2 mb-5">
          {questions?.map((_, index) => (
            <Button
              key={index}
              className={`aspect-square text-sm ${getQuestionButtonStyle(index)}`}
              style={{ border: "1px solid" }}
              onClick={() => setCurrentQuestionIndex(index)}
            >
              {index + 1}
            </Button>
          ))}
        </div>

        {/* Time Display */}
        <div className="mb-5 p-3 rounded-lg">
          <div className="text-center">
            <p className="font-medium">Waktu:</p>
            <div className="text-xl font-bold border border-[#acaeba] rounded p-2 mt-2 max-w-[150px] mx-auto">
              {timeLeft <= 0 ? "--:--" : formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 lg:px-10 lg:py-5 px-0 py-0 flex flex-col">
        <div className="flex-1 bg-white lg:rounded-lg border-0 lg:border border-[#acaeba] overflow-hidden flex flex-col">
          {questions && questions[currentQuestionIndex] && (
            <div key={questions[currentQuestionIndex].id} className="flex-1 flex flex-col">
              {/* Font Size Controls*/}
              <div className="hidden lg:block bg-white p-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold">Ukuran:</span>
                  <Button 
                    variant={fontSize === "text-lg" ? "default" : "outline"} 
                    size="sm" 
                    className="text-lg font-bold text-black"
                    onClick={() => setFontSize("text-lg")}
                  >
                    Aa
                  </Button>
                  <Button 
                    variant={fontSize === "text-base" ? "default" : "outline"} 
                    size="sm" 
                    className="text-base font-bold text-black"
                    onClick={() => setFontSize("text-base")}
                  >
                    Aa
                  </Button>
                  <Button 
                    variant={fontSize === "text-sm" ? "default" : "outline"} 
                    size="sm" 
                    className="text-sm font-bold text-black"
                    onClick={() => setFontSize("text-sm")}
                  >
                    Aa
                  </Button>
                </div>
              </div>

              {/* Question Content */}
              <div className="flex-1 overflow-y-auto px-4 lg:px-6">
                <div className="border-0 lg:border border-[#acaeba] rounded-lg p-2 mb-2">
                  <div className="mb-2">
                    <Editor
                      content={questions[currentQuestionIndex].content}
                      className="border-none"
                      fontSize={fontSize}
                    />
                    {questions[currentQuestionIndex].imageUrl && (
                      <Image
                        src={questions[currentQuestionIndex].imageUrl}
                        alt="Question Image"
                        width={300}
                        height={300}
                        className="max-h-[50vh] w-fit mt-3"
                      />
                    )}
                  </div>

                  {/* Answer Choices */}
                  {questions[currentQuestionIndex].type === "essay" ? (
                    <Input
                      className="w-full rounded border p-3"
                      placeholder="Write your answer here..."
                      style={{
                        fontSize: fontSize === "text-sm" ? "14px" : 
                                 fontSize === "text-base" ? "16px" : "18px"
                      }}
                      value={
                        selectedAnswers.get(questions[currentQuestionIndex].id) ||
                        ""
                      }
                      onChange={(e) =>
                        handleAnswerChange(
                          questions[currentQuestionIndex].id,
                          e.target.value,
                        )
                      }
                      disabled={isSessionCompleted}
                    />
                  ) : (
                    <div className="space-y-2">
                      {questions[currentQuestionIndex].answers.map((answer) => {
                        const isCorrectAnswer = questions[currentQuestionIndex].correctAnswerChoice === answer.index;
                        const isUserAnswer = selectedAnswers.get(questions[currentQuestionIndex].id) === answer.index;
                        
                        let answerStyle = "";
                        if (canViewReview) {
                          if (isCorrectAnswer) {
                            answerStyle = "bg-[#84b338] border-[#acaeba] text-black";
                          } else if (isUserAnswer) {
                            answerStyle = "bg-[#ff3d00] border-[#acaeba] text-black";
                          } else {
                            answerStyle = "bg-white border-[#acaeba]";
                          }
                        } else {
                          answerStyle = isUserAnswer 
                            ? "bg-[#acaeba] border-[#acaeba]" 
                            : "hover:bg-gray-50 border-[#acaeba]";
                        }
                        
                        return (
                          <label
                            key={answer.index}
                            className={`flex items-center p-1 lg:p-2 rounded-lg border cursor-pointer transition-all ${answerStyle} ${
                              isSessionCompleted && "cursor-default"
                            }`}
                          >
                            <input
                              type="radio"
                              disabled={isSessionCompleted}
                              name={`question-${questions[currentQuestionIndex].id}`}
                              value={answer.index}
                              className="hidden"
                              checked={
                                selectedAnswers.get(
                                  questions[currentQuestionIndex].id,
                                ) === answer.index
                              }
                              onChange={() =>
                                handleAnswerChange(
                                  questions[currentQuestionIndex].id,
                                  answer.index,
                                )
                              }
                            />
                            <div className="flex-1">
                              <Editor 
                                content={answer.content} 
                                className="border-none" 
                                fontSize={fontSize}
                              />
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Explanation */}
                  {canViewReview && (
                    <div className="mt-6 p-2 border-t border-[#acaeba] border rounded-lg">
                      <p className="font-bold text-lg ml-2">Pembahasan</p>
                      <div className="rounded">
                        <Editor
                          content={questions[currentQuestionIndex].explanation ?? "Tidak ada pembahasan tersedia."}
                          fontSize={fontSize}
                        />
                      </div>
                    </div>
                  )}

                  {isSessionCompleted && !isPackageEndDatePassed && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <p className="text-blue-800 font-medium">
                          Quiz telah selesai! Pembahasan akan tersedia setelah tanggal berakhir tryout.
                        </p>
                      </div>
                      <p className="text-blue-600 text-sm mt-2">
                        Tanggal berakhir: {packageData?.TOend ? new Date(packageData.TOend).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        }) : 'Belum ditentukan'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {!isSessionCompleted && (
                <div className="bg-white p-4 border-t border-b lg:border-b-0 lg:border-t-0 border-[#acaeba]">
                  <div className="flex justify-between">
                    <Button
                      variant="default"
                      onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                      disabled={currentQuestionIndex === 0}
                    >
                      ← Kembali
                    </Button>
                    
                    <Button
                      onClick={() => handleDoubtfulToggle(questions[currentQuestionIndex].id)}
                      className={`px-6 py-2 ${
                        doubtfulQuestions.has(questions[currentQuestionIndex].id)
                          ? "bg-yellow-500 text-black hover:bg-yellow-500/80 hover:text-black"
                          : "bg-[#ffde59] text-black font-bold hover:bg-[#ffde59]/80 hover:text-black"
                      }`}
                    >
                      Ragu-ragu
                    </Button>
                    
                    {currentQuestionIndex === questions.length - 1 ? (
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
                      >
                        {isSubmitting ? "Submitting..." : "Submit"}
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                      >
                        Selanjutnya →
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
