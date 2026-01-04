import { Badge } from "~/app/_components/ui/badge";
import { Button } from "~/app/_components/ui/button";
import { Card, CardContent } from "~/app/_components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Editor from "~/app/_components/editor";
import { AnswerOptions } from "./AnswerOptions";
import { QuestionExplanation } from "./QuestionExplanation";

type Question = {
  id: number;
  content: string;
  imageUrl: string | null;
  type: string;
  explanation: string | null;
  videoExplanation: string | null;
  answers: {
    id: number;
    content: string;
    isCorrect?: boolean;
    index: number;
  }[];
};

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer: number[] | string | undefined;
  isQuizEnded: boolean;
  isUserRole: boolean;
  isSaving: boolean;
  onAnswerChange: (questionId: number, answerValue: string | number[]) => void;
  onAnswerToggle: (questionId: number, answerId: number) => void;
  onSingleAnswerSelect: (questionId: number, answerId: number) => void;
  onNavigate: (direction: "prev" | "next") => void;
  onSubmit: () => void;
}

export function QuestionCard({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  isQuizEnded,
  isUserRole,
  isSaving,
  onAnswerChange,
  onAnswerToggle,
  onSingleAnswerSelect,
  onNavigate,
  onSubmit,
}: QuestionCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Question Header */}
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className="border-[#2b8057] text-[#2b8057]"
            >
              Soal {currentIndex + 1}
            </Badge>
          </div>

          {/* Question Content */}
          <div className="rounded-lg bg-gray-50 p-4">
            <Editor
              key={question.id}
              content={question.content}
              className="border-none"
            />
            {question.imageUrl && (
              <Image
                src={question.imageUrl}
                alt="Question Image"
                width={400}
                height={300}
                className="mt-4 max-h-[50vh] w-auto rounded-lg"
              />
            )}
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            <AnswerOptions
              question={question}
              selectedAnswer={selectedAnswer}
              isQuizEnded={isQuizEnded}
              isUserRole={isUserRole}
              onAnswerChange={onAnswerChange}
              onAnswerToggle={onAnswerToggle}
              onSingleAnswerSelect={onSingleAnswerSelect}
            />
          </div>

          {/* Explanation (shown after session ends) */}
          {isQuizEnded && (
            <QuestionExplanation
              explanation={question.explanation}
              videoExplanation={question.videoExplanation}
              questionId={question.id}
            />
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col items-center justify-between space-y-2 pt-4 md:flex-row md:space-y-0">
            <Button
              variant="outline"
              onClick={() => onNavigate("prev")}
              disabled={currentIndex === 0 || isSaving}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              {isSaving ? "Menyimpan..." : "Sebelumnya"}
            </Button>

            {currentIndex === totalQuestions - 1 ? (
              <Button
                onClick={onSubmit}
                disabled={isSaving || isQuizEnded}
                className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700"
              >
                {isSaving ? "Menyimpan..." : "Selesai"}
              </Button>
            ) : (
              <Button
                onClick={() => onNavigate("next")}
                disabled={isSaving}
                className="flex items-center gap-2 bg-[#2b8057] text-white hover:bg-[#1f5a40]"
              >
                {isSaving ? "Menyimpan..." : "Selanjutnya"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
