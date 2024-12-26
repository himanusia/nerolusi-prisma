"use client";

import { useEffect, useState } from "react";
import { Button } from "~/app/_components/ui/button";
import { api } from "~/trpc/react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Input } from "~/app/_components/ui/input";
import Image from "next/image";

type Question = {
  id: number;
  subtestId: number;
  index: number;
  content: string;
  imageUrl?: string;
  answers: { id: number; questionId: number; index: number; content: string }[];
  correctAnswerChoice?: number | null;
  explanation?: string | null;
  score?: number | null;
};

export default function QuizPage() {
  const { paket, sessionId } = useParams();
  const router = useRouter();
  const sessionIdString = Array.isArray(sessionId) ? sessionId[0] : sessionId;

  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Map<number, number>>(
    new Map(),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const saveAnswerMutation = api.quiz.saveAnswer.useMutation();
  const submitMutation = api.quiz.submitQuiz.useMutation();

  const {
    data: sessionDetails,
    isLoading: isSessionLoading,
    isError: isSessionError,
  } = api.quiz.getSessionDetails.useQuery({ sessionId: sessionIdString });

  useEffect(() => {
    if (
      sessionDetails?.endTime &&
      new Date(sessionDetails.endTime) < new Date() &&
      new Date(sessionDetails.package.TOend) >= new Date()
    ) {
      router.push(`/tryout/${paket}`);
    }
  }, [sessionDetails, router, paket]);

  const {
    data: questions,
    isLoading: isQuestionsLoading,
    isError: isQuestionsError,
  } = api.quiz.getQuestionsBySubtest.useQuery(
    { subtestId: sessionDetails?.subtestId ?? 0 },
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
        const initialSelectedAnswers = new Map<number, number>();
        sessionDetails.userAnswers.forEach((ua) => {
          initialSelectedAnswers.set(ua.questionId, ua.answerChoice);
        });
        setSelectedAnswers(initialSelectedAnswers);
      }
    }
  }, [sessionDetails]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(() => {
        const newTimeLeft = Math.max(endTime - Date.now(), 0);
        if (
          newTimeLeft <= 0 &&
          !isSubmitting &&
          !isSessionLoading &&
          !isQuestionsLoading &&
          !isSessionError &&
          !isQuestionsError &&
          new Date(sessionDetails.package.TOend) >= new Date()
        ) {
          clearInterval(timer);
          handleSubmit();
        }
        return newTimeLeft;
      });
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

  // Handle answer selection and save
  const handleAnswerSelect = (questionId: number, answerChoice: number) => {
    setSelectedAnswers((prev) => {
      const updatedAnswers = new Map(prev);

      if (updatedAnswers.get(questionId) !== answerChoice) {
        updatedAnswers.set(questionId, answerChoice);
        saveAnswer(questionId, answerChoice);
      }

      return updatedAnswers;
    });
  };

  // Save answer to the backend
  const saveAnswer = async (questionId: number, answerChoice: number) => {
    if (new Date(sessionDetails.package.TOend) < new Date()) return;

    try {
      await saveAnswerMutation.mutateAsync({
        quizSessionId: parseInt(sessionIdString),
        questionId,
        answerChoice,
        packageId: sessionDetails?.packageId ?? 0,
        userId: sessionDetails?.userId ?? "",
      });
    } catch (error) {
      console.error("Failed to save answer:", error);
      toast.error("Failed to save answer. Please try again.");
    }
  };

  // Autosave
  useEffect(() => {
    const autosaveInterval = setInterval(() => {
      selectedAnswers.forEach((answerChoice, questionId) => {
        saveAnswer(questionId, answerChoice);
      });
    }, 5000);

    return () => clearInterval(autosaveInterval);
  }, [selectedAnswers, sessionIdString]);

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
      router.push(`/tryout/${paket}`);
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      toast.error("Failed to submit quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render loading or error state
  if (isSessionLoading || isQuestionsLoading) return <div>Loading...</div>;
  if (isSessionError || isQuestionsError) return <div>Failed to load data</div>;

  return (
    <div className="flex w-full flex-col gap-3 p-4">
      <div>
        <p>
          <strong>Subtest:</strong> {sessionDetails?.subtest.type}
        </p>
        <p className={`${timeLeft <= 0 ? "hidden" : ""}`}>
          <strong>Time Left:</strong> {formatTime(timeLeft)}
        </p>
      </div>

      <div className="flex w-full gap-4">
        {/* Main Content */}
        <div className="flex w-full min-w-96 flex-col gap-5 overflow-hidden rounded-md border p-3">
          {/* Display the current question */}
          {new Date(sessionDetails.endTime) < new Date() && (
            <p>
              <strong>
                Score:{" "}
                {selectedAnswers.get(questions[currentQuestionIndex].id) ===
                questions[currentQuestionIndex].correctAnswerChoice
                  ? questions[currentQuestionIndex].score
                  : 0}
              </strong>
            </p>
          )}
          <div className="gap-4">
            {questions && questions[currentQuestionIndex] && (
              <div
                key={questions[currentQuestionIndex].id}
                className="space-y-2"
              >
                <p>
                  <strong>
                    {currentQuestionIndex + 1}.{" "}
                    {questions[currentQuestionIndex].content}
                  </strong>
                </p>
                <Image
                  src={questions[currentQuestionIndex].imageUrl}
                  alt="Question Image"
                  width={300}
                  height={200}
                  className="max-h-[50vh] w-fit"
                />
                {questions[currentQuestionIndex].answers.map((answer) => (
                  <label
                    key={answer.index}
                    className="flex cursor-pointer flex-row items-center"
                  >
                    <Input
                      type="radio"
                      disabled={
                        new Date(sessionDetails.package.TOend) < new Date()
                      }
                      name={`question-${questions[currentQuestionIndex].id}`}
                      value={answer.index}
                      className="mr-2 size-fit"
                      checked={
                        selectedAnswers.get(
                          questions[currentQuestionIndex].id,
                        ) === answer.index
                      }
                      onChange={() =>
                        handleAnswerSelect(
                          questions[currentQuestionIndex].id,
                          answer.index,
                        )
                      }
                    />
                    {answer.content}
                  </label>
                ))}
              </div>
            )}
          </div>
          {new Date(sessionDetails.endTime) < new Date() && (
            <p className="font-bold">
              Explanation:{" "}
              {questions[currentQuestionIndex].explanation ?? "N/A"}
            </p>
          )}
        </div>

        {/* Sidebar for navigating questions */}
        <div className="flex w-fit flex-col justify-between gap-3 rounded-md border p-3">
          <ul className="flex size-fit gap-3">
            {questions?.map((_, index) => (
              <li key={index} className="size-fit">
                <Button
                  className={`size-fit ${
                    selectedAnswers.has(questions[index].id)
                      ? "bg-green-500 text-white"
                      : ""
                  }`}
                  onClick={() => setCurrentQuestionIndex(index)}
                >
                  {index + 1}
                </Button>
              </li>
            ))}
          </ul>

          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
}
