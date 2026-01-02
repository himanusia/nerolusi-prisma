import { Button } from "~/app/_components/ui/button";
import { Card, CardContent } from "~/app/_components/ui/card";
import { Flag } from "lucide-react";
import Link from "next/link";

type Question = {
  id: number;
};

interface QuestionNavigationProps {
  questions: Question[];
  currentQuestionIndex: number;
  answeredQuestions: Set<number>;
  isQuizEnded: boolean;
  isUserRole: boolean;
  isSubmitting: boolean;
  isSaving: boolean;
  sessionId: string;
  onQuestionSelect: (index: number) => void;
  onSubmit: () => void;
}

export function QuestionNavigation({
  questions,
  currentQuestionIndex,
  answeredQuestions,
  isQuizEnded,
  isUserRole,
  isSubmitting,
  isSaving,
  sessionId,
  onQuestionSelect,
  onSubmit,
}: QuestionNavigationProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="mb-4 font-semibold text-gray-900">Navigasi Soal</h3>

        {/* Question Grid */}
        <div className="mb-6 grid grid-cols-5 gap-2 lg:grid-cols-4">
          {questions.map((question, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className={`aspect-square text-xs ${
                index === currentQuestionIndex
                  ? "border-[#2b8057] bg-[#2b8057] text-white"
                  : answeredQuestions.has(question.id)
                    ? "border-green-300 bg-green-100 text-green-800"
                    : "hover:border-[#2b8057]"
              }`}
              onClick={() => onQuestionSelect(index)}
              disabled={isSaving}
            >
              {index + 1}
            </Button>
          ))}
        </div>

        {/* Submit Button */}
        {!isQuizEnded && isUserRole ? (
          <Button
            onClick={onSubmit}
            disabled={isSubmitting || isSaving || isQuizEnded}
            className="flex w-full items-center gap-2 bg-red-600 text-white hover:bg-red-700"
          >
            <Flag className="h-4 w-4" />
            {isSaving
              ? "Menyimpan..."
              : isSubmitting
                ? "Mengirim..."
                : "Selesai"}
          </Button>
        ) : (
          <Link href={`/quiz/${sessionId}/score`}>
            <Button className="flex w-full gap-2" disabled={!isQuizEnded}>
              <Flag className="h-4 w-4" />
              Lihat Hasil
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
