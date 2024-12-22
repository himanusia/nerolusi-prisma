// src/app/_components/form/answer-form.tsx
"use client";

import React from "react";
import { Textarea } from "~/app/_components/ui/textarea";
import { Button } from "~/app/_components/ui/button";
import { Answer } from "~/lib/types";

interface AnswerFormProps {
  subtestIndex: number;
  questionIndex: number;
  answerIndex: number;
  answer: Answer;
  isCorrect: boolean;
  setAsCorrect: () => void;
  handleAnswerChange: (
    subtestIndex: number,
    questionIndex: number,
    answerIndex: number,
    value: string,
  ) => void;
  removeAnswer: (
    subtestIndex: number,
    questionIndex: number,
    answerIndex: number,
  ) => void;
}

const AnswerForm: React.FC<AnswerFormProps> = ({
  subtestIndex,
  questionIndex,
  answerIndex,
  answer,
  isCorrect,
  setAsCorrect,
  handleAnswerChange,
  removeAnswer,
}) => {
  return (
    <div className="flex items-center gap-2">
      <input
        type="radio"
        name={`correctAnswer-${subtestIndex}-${questionIndex}`}
        checked={isCorrect}
        onChange={setAsCorrect}
      />
      <Textarea
        value={answer.content}
        onChange={(e) =>
          handleAnswerChange(
            subtestIndex,
            questionIndex,
            answerIndex,
            e.target.value,
          )
        }
        className="flex-1"
      />
      <Button
        type="button"
        onClick={() => removeAnswer(subtestIndex, questionIndex, answerIndex)}
      >
        Remove
      </Button>
    </div>
  );
};

export default AnswerForm;
