"use client";

import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import ErrorPage from "~/app/error";
import LoadingPage from "~/app/loading";
import { QuizHeader } from "./QuizHeader";
import { QuestionCard } from "./QuestionCard";
import { QuestionNavigation } from "./QuestionNavigation";

export default function QuizPage() {
  const { sessionId } = useParams(); // drill = subject, subtest = videoId
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
      <QuizHeader
        subtestType={sessionDetails?.subtest.type ?? ""}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions?.length ?? 0}
        timeLeft={timeLeft}
        endTime={sessionDetails?.endTime ?? new Date()}
        answeredCount={selectedAnswers.size}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Main Question Area */}
        <div className="lg:col-span-3">
          {questions && questions[currentQuestionIndex] && (
            <QuestionCard
              question={questions[currentQuestionIndex]}
              currentIndex={currentQuestionIndex}
              totalQuestions={questions.length}
              selectedAnswer={selectedAnswers.get(
                questions[currentQuestionIndex].id,
              )}
              isQuizEnded={
                new Date(sessionDetails?.endTime ?? new Date()) < new Date()
              }
              isUserRole={session.data?.user?.role === "user"}
              onAnswerChange={handleAnswerChange}
              onAnswerToggle={handleAnswerToggle}
              onSingleAnswerSelect={handleSingleAnswerSelect}
              onNavigate={(direction) => {
                if (direction === "prev") {
                  setCurrentQuestionIndex(
                    Math.max(0, currentQuestionIndex - 1),
                  );
                } else {
                  setCurrentQuestionIndex(
                    Math.min(
                      (questions?.length || 1) - 1,
                      currentQuestionIndex + 1,
                    ),
                  );
                }
              }}
            />
          )}
        </div>

        {/* Sidebar - Question Navigation */}
        <div className="lg:col-span-1">
          {questions && (
            <QuestionNavigation
              questions={questions}
              currentQuestionIndex={currentQuestionIndex}
              answeredQuestions={new Set(selectedAnswers.keys())}
              isQuizEnded={
                new Date(sessionDetails?.endTime ?? new Date()) < new Date()
              }
              isUserRole={session.data?.user.role === "user"}
              isSubmitting={isSubmitting}
              sessionId={sessionIdString}
              onQuestionSelect={setCurrentQuestionIndex}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
}
