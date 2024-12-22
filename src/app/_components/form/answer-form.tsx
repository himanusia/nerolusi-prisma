"use client";

import React from "react";
import { Button } from "~/app/_components/ui/button";
import { Textarea } from "../ui/textarea";

interface Answer {
  id?: number;
  index: number;
  content: string;
}

interface AnswerFormProps {
  subtestIndex: number;
  questionIndex: number;
  answerIndex: number;
  answer: Answer;
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
  handleAnswerChange,
  removeAnswer,
}) => {
  return (
    <div className="flex items-center gap-2">
      <span>{String.fromCharCode(65 + answerIndex)}.</span>
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
