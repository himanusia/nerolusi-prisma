import { CheckCircle } from "lucide-react";
import { Input } from "~/app/_components/ui/input";
import Editor from "~/app/_components/editor";

type Question = {
  id: number;
  type: string;
  answers: {
    id: number;
    content: string;
    isCorrect?: boolean;
    index: number;
  }[];
};

interface AnswerOptionsProps {
  question: Question;
  selectedAnswer: number[] | string | undefined;
  isQuizEnded: boolean;
  isUserRole: boolean;
  onAnswerChange: (questionId: number, answerValue: string | number[]) => void;
  onAnswerToggle: (questionId: number, answerId: number) => void;
  onSingleAnswerSelect: (questionId: number, answerId: number) => void;
}

export function AnswerOptions({
  question,
  selectedAnswer,
  isQuizEnded,
  isUserRole,
  onAnswerChange,
  onAnswerToggle,
  onSingleAnswerSelect,
}: AnswerOptionsProps) {
  if (question.type === "essay") {
    return (
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Jawaban Anda:
          </label>
          <textarea
            rows={4}
            className="w-full rounded-lg border p-3 text-sm"
            placeholder="Tulis jawaban Anda di sini..."
            value={typeof selectedAnswer === "string" ? selectedAnswer : ""}
            onChange={(e) => onAnswerChange(question.id, e.target.value)}
            disabled={isQuizEnded && isUserRole}
          />
        </div>

        {/* Show correct answer after quiz ends */}
        {isQuizEnded && question.answers[0] && (
          <>
            {/* User's Answer */}
            {(() => {
              const userAnswerText =
                typeof selectedAnswer === "string" ? selectedAnswer : "";
              const correctAnswer = question.answers[0].content;
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
                      isCorrect ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    Jawaban Anda: {isCorrect ? "(Benar)" : "(Salah)"}
                  </label>
                  <div className="rounded-lg bg-white p-3 text-sm text-gray-900">
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
                  key={question.id}
                  content={question.answers[0].content}
                  className="border-none"
                />
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Multiple choice or single answer
  const isMultipleAnswer = question.type === "mulAnswer";

  return (
    <div className="space-y-2">
      {question.answers.map((answer) => {
        const isSelected = Array.isArray(selectedAnswer)
          ? selectedAnswer.includes(answer.id)
          : typeof selectedAnswer === "number" && selectedAnswer === answer.id;
        const isCorrect = isQuizEnded && answer.isCorrect;
        const isWrong =
          (isQuizEnded && isSelected && !answer.isCorrect) ||
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
            } ${!(isQuizEnded && isUserRole) ? "hover:border-[#2b8057]" : ""}`}
          >
            <Input
              type={isMultipleAnswer ? "checkbox" : "radio"}
              disabled={isQuizEnded && isUserRole}
              name={
                isMultipleAnswer
                  ? `question-${question.id}-answer-${answer.id}`
                  : `question-${question.id}`
              }
              value={answer.id}
              className="sr-only"
              checked={isSelected}
              onChange={() =>
                isMultipleAnswer
                  ? onAnswerToggle(question.id, answer.id)
                  : onSingleAnswerSelect(question.id, answer.id)
              }
            />
            <div
              className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center ${
                isMultipleAnswer ? "rounded" : "rounded-full"
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
                      isCorrect || isWrong ? "text-white" : "text-white"
                    }`}
                  />
                ) : (
                  <div
                    className={`h-2 w-2 rounded-full ${
                      isCorrect || isWrong ? "bg-white" : "bg-white"
                    }`}
                  />
                ))}
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="font-medium">
                  {String.fromCharCode(65 + answer.index)}.
                </span>
                {isCorrect && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </div>
              <div className="flex rounded-lg border border-gray-200 px-3 py-4">
                {answer.content}
              </div>
            </div>
          </label>
        );
      })}
    </div>
  );
}
