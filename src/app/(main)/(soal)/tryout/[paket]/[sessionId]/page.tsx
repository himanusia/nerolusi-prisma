"use client";

import { useEffect, useState } from "react";
import { Button } from "~/app/_components/ui/button";
import { api } from "~/trpc/react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

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

  const saveAnswerMutation = api.quiz.saveAnswer.useMutation();

  const {
    data: sessionDetails,
    isLoading: isSessionLoading,
    isError: isSessionError,
  } = api.quiz.getSessionDetails.useQuery({ sessionId: sessionIdString });

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
    }
  }, [sessionDetails]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTimeLeft = Math.max(endTime - Date.now(), 0);
        if (newTimeLeft <= 0) {
          clearInterval(timer);
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
    try {
      for (const [questionId, answerChoice] of selectedAnswers.entries()) {
        await saveAnswer(questionId, answerChoice);
      }
      toast("Quiz submitted successfully!");
      router.push(`/tryout/${paket}`);
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      toast("Failed to submit quiz. Please try again.");
    }
  };

  // Render loading or error state
  if (isSessionLoading || isQuestionsLoading) return <div>Loading...</div>;
  if (isSessionError || isQuestionsError) return <div>Failed to load data</div>;

  return (
    <div className="flex w-full gap-3 p-4">
      {/* Main Content */}
      <div className="w-full rounded-md border p-3">
        <h1 className="text-xl font-bold">Quiz Session</h1>
        <div className="mt-4">
          <p>
            <strong>Subtest:</strong> {sessionDetails?.subtest.type}
          </p>
          <p>
            <strong>Time Left:</strong> {formatTime(timeLeft)}
          </p>
        </div>

        {/* Display the current question */}
        <div className="mt-4 space-y-4">
          {questions && questions[currentQuestionIndex] && (
            <div key={questions[currentQuestionIndex].id} className="space-y-2">
              <p>
                <strong>
                  {currentQuestionIndex + 1}.{" "}
                  {questions[currentQuestionIndex].content}
                </strong>
              </p>
              {questions[currentQuestionIndex].answers.map((answer) => (
                <label key={answer.id} className="block">
                  <input
                    type="radio"
                    name={`question-${questions[currentQuestionIndex].id}`}
                    value={answer.id}
                    className="mr-2"
                    checked={
                      selectedAnswers.get(
                        questions[currentQuestionIndex].id,
                      ) === answer.id
                    }
                    onChange={() =>
                      handleAnswerSelect(
                        questions[currentQuestionIndex].id,
                        answer.id,
                      )
                    }
                  />
                  {answer.content}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar for navigating questions */}
      <div className="flex w-fit flex-col justify-between rounded-md border p-3">
        <ul className="flex flex-wrap gap-1">
          {questions?.map((_, index) => (
            <li key={index}>
              <Button
                className="w-12"
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </Button>
            </li>
          ))}
        </ul>

        <Button onClick={handleSubmit}>Submit</Button>
      </div>
    </div>
  );
}
