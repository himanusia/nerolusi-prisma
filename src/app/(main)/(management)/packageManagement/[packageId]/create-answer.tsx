"use client";

import "katex/dist/katex.min.css";
import "./styles.css";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "~/app/_components/ui/button";
import { api } from "~/trpc/react";
import { useEffect, useState } from "react";
import { type answer } from "~/server/db/schema";

export default function AnswerEditor({
  questionId,
  correctId,
}: {
  questionId: string;
  correctId: string;
}) {
  const addAnswerApi = api.answer.createAnswer.useMutation();
  const updateAnswerApi = api.answer.updateAnswer.useMutation();
  const updateQuestionApi = api.question.updateCorrectAnswer.useMutation();
  const getAnswer = api.answer.getAnswer.useQuery({ questionId });

  const [answers, setAnswers] = useState<answer[]>([]);

  useEffect(() => {
    if (getAnswer.data) {
      setAnswers(getAnswer.data);
    }
  }, [getAnswer.data]);

  const addNewAnswer = async () => {
    // Create a temporary answer
    const newAnswer: answer = {
      id: crypto.randomUUID(),
      index: answers.length + 1,
      questionId,
      content: "",
    };

    // Update state to include the new answer
    setAnswers((prev) => [...prev, newAnswer]);

    // Attempt to create the answer via API
    try {
      await addAnswerApi.mutateAsync({
        id: newAnswer.id,
        content: newAnswer.content,
        questionId: newAnswer.questionId,
        index: newAnswer.index,
      });
    } catch (error) {
      console.error("Error creating answer:", error);
    }
  };

  const saveAnswer = async (answer: answer) => {
    try {
      if (answer.content.trim()) {
        await updateAnswerApi.mutateAsync({
          content: answer.content,
          answerId: answer.id,
          index: answer.index,
        });
      }
    } catch (error) {
      console.error("Error saving answer:", error);
    }
  };

  const setCorrectAnswer = async (answerId: string) => {
    await updateQuestionApi.mutateAsync({
      questionId,
      correctAnswerId: answerId,
    });
  };

  return (
    <div>
      <h3>Answers</h3>
      {answers.map((answer) => (
        <AnswerItem
          key={answer.id}
          answer={answer}
          isCorrect={answer.id === correctId}
          onContentChange={async (content) => {
            const updatedAnswer = { ...answer, content };
            setAnswers((prev) =>
              prev.map((a) => (a.id === answer.id ? updatedAnswer : a)),
            );
            await saveAnswer(updatedAnswer);
          }}
          onCorrectSelect={() => setCorrectAnswer(answer.id)}
        />
      ))}
      <Button onClick={addNewAnswer}>Add Answer</Button>
    </div>
  );
}

function AnswerItem({
  answer,
  isCorrect,
  onContentChange,
  onCorrectSelect,
}: {
  answer: answer;
  isCorrect: boolean;
  onContentChange: (content: string) => void;
  onCorrectSelect: () => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: answer.content,
    onUpdate: ({ editor }) => {
      onContentChange(editor.getHTML());
    },
  });

  return (
    <div className="mb-4 flex items-center">
      <EditorContent editor={editor} className="w-full border p-2" />
      <Button
        onClick={onCorrectSelect}
        className={`ml-2 ${isCorrect ? "bg-primary" : ""}`}
      >
        {isCorrect ? "Correct" : "Set Correct"}
      </Button>
    </div>
  );
}
