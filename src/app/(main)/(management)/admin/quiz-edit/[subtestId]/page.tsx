"use client";

import { useEffect, useState } from "react";
import { Button } from "~/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/app/_components/ui/card";
import { Badge } from "~/app/_components/ui/badge";
import { api } from "~/trpc/react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Input } from "~/app/_components/ui/input";
import { Textarea } from "~/app/_components/ui/textarea";
import { useSession } from "next-auth/react";
import ErrorPage from "~/app/error";
import LoadingPage from "~/app/loading";
import Editor from "~/app/_components/editor";
import { Separator } from "~/app/_components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/app/_components/ui/select";
import { Checkbox } from "~/app/_components/ui/checkbox";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Save,
  Edit,
} from "lucide-react";
import Link from "next/link";
import { QuestionType } from "@prisma/client";
import { UploadDropzone } from "~/utils/uploadthing";
import Image from "next/image";

interface Answer {
  id?: number;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id?: number;
  questionText: string;
  questionType: QuestionType;
  orderIndex: number;
  score: number;
  imageUrl?: string;
  answers: Answer[];
}

export default function QuizEditPage() {
  const { subtestId } = useParams();
  const router = useRouter();
  const session = useSession();
  const subtestIdString = Array.isArray(subtestId) ? subtestId[0] : subtestId;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // API mutations
  const createQuestionMutation = api.quiz.createQuestion.useMutation({
    onSuccess: () => {
      toast.success("Question created successfully");
      refetch();
      setIsEditing(false);
      setEditingQuestion(null);
    },
    onError: (error) => {
      toast.error(`Failed to create question: ${error.message}`);
    },
  });

  const updateQuestionMutation = api.quiz.updateQuestion.useMutation({
    onSuccess: () => {
      toast.success("Question updated successfully");
      refetch();
      setIsEditing(false);
      setEditingQuestion(null);
    },
    onError: (error) => {
      toast.error(`Failed to update question: ${error.message}`);
    },
  });

  const deleteQuestionMutation = api.quiz.deleteQuestion.useMutation({
    onSuccess: () => {
      toast.success("Question deleted successfully");
      refetch();
      setCurrentQuestionIndex(0);
    },
    onError: (error) => {
      toast.error(`Failed to delete question: ${error.message}`);
    },
  });

  const {
    data: questionsData,
    isLoading,
    isError,
    refetch,
  } = api.quiz.getSubtestForEdit.useQuery({
    subtestId: subtestIdString ?? "0",
  });

  useEffect(() => {
    if (questionsData) {
      setQuestions(
        questionsData.questions.map((q) => ({
          id: q.id,
          questionText: q.content,
          questionType: q.type,
          orderIndex: q.index,
          score: q.score,
          imageUrl: q.imageUrl || undefined,
          answers: q.answers.map((a) => ({
            id: a.id,
            text: a.content,
            isCorrect: a.isCorrect,
          })),
        })),
      );
    }
  }, [questionsData]);

  if (session.status === "loading" || isLoading) return <LoadingPage />;
  if (session.status === "unauthenticated") return <ErrorPage />;
  if (isError) return <ErrorPage />;
  if (session.data?.user?.role !== "admin") {
    return <ErrorPage />;
  }

  const currentQuestion = questions[currentQuestionIndex];

  const handleNewQuestion = () => {
    const newQuestion: Question = {
      questionText: "",
      questionType: QuestionType.mulChoice,
      orderIndex: questions.length + 1,
      score: 10,
      imageUrl: undefined,
      answers: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
    };
    setEditingQuestion(newQuestion);
    setIsEditing(true);
  };

  const handleEditQuestion = (question: Question) => {
    // Ensure essay questions have at least one answer for the correct answer field
    if (
      question.questionType === QuestionType.essay &&
      question.answers.length === 0
    ) {
      question.answers = [{ text: "", isCorrect: true }];
    }
    setEditingQuestion({ ...question });
    setIsEditing(true);
  };

  const handleSaveQuestion = () => {
    if (!editingQuestion) return;

    // Validate question
    if (!editingQuestion.questionText.trim()) {
      toast.error("Question text is required");
      return;
    }

    if (
      editingQuestion.questionType === QuestionType.mulChoice ||
      editingQuestion.questionType === QuestionType.mulAnswer
    ) {
      if (editingQuestion.answers.length < 2) {
        toast.error("Multiple choice/answer questions need at least 2 answers");
        return;
      }

      const hasCorrectAnswer = editingQuestion.answers.some((a) => a.isCorrect);
      if (!hasCorrectAnswer) {
        toast.error("At least one answer must be marked as correct");
        return;
      }

      // For multiple choice, only one answer should be correct
      if (editingQuestion.questionType === QuestionType.mulChoice) {
        const correctAnswers = editingQuestion.answers.filter(
          (a) => a.isCorrect,
        );
        if (correctAnswers.length > 1) {
          toast.error(
            "Multiple choice questions can only have one correct answer",
          );
          return;
        }
      }

      const hasEmptyAnswers = editingQuestion.answers.some(
        (a) => !a.text.trim(),
      );
      if (hasEmptyAnswers) {
        toast.error("All answer options must have text");
        return;
      }
    }

    // Validate essay questions
    if (editingQuestion.questionType === QuestionType.essay) {
      if (!editingQuestion.answers[0]?.text.trim()) {
        toast.error("Essay questions must have a correct answer");
        return;
      }
    }

    if (editingQuestion.id) {
      // Update existing question
      updateQuestionMutation.mutate({
        questionId: editingQuestion.id,
        content: editingQuestion.questionText,
        type: editingQuestion.questionType,
        score: editingQuestion.score,
        imageUrl: editingQuestion.imageUrl,
        answers: editingQuestion.answers.map((a) => ({
          id: a.id,
          content: a.text,
          isCorrect: a.isCorrect,
        })),
      });
    } else {
      // Create new question
      createQuestionMutation.mutate({
        subtestId: subtestIdString ?? "0",
        content: editingQuestion.questionText,
        type: editingQuestion.questionType,
        score: editingQuestion.score,
        imageUrl: editingQuestion.imageUrl,
        answers: editingQuestion.answers.map((a) => ({
          content: a.text,
          isCorrect: a.isCorrect,
        })),
      });
    }
  };

  const handleDeleteQuestion = (questionId: number) => {
    if (confirm("Are you sure you want to delete this question?")) {
      deleteQuestionMutation.mutate({ questionId });
    }
  };

  const handleAnswerChange = (
    answerIndex: number,
    field: "text" | "isCorrect",
    value: string | boolean,
  ) => {
    if (!editingQuestion) return;

    const updatedAnswers = [...editingQuestion.answers];
    if (field === "text") {
      updatedAnswers[answerIndex] = {
        ...updatedAnswers[answerIndex]!,
        text: value as string,
      };
    } else {
      // For multiple choice, uncheck other answers when one is selected
      if (
        editingQuestion.questionType === QuestionType.mulChoice &&
        value === true
      ) {
        updatedAnswers.forEach((answer, index) => {
          answer.isCorrect = index === answerIndex;
        });
      } else {
        updatedAnswers[answerIndex] = {
          ...updatedAnswers[answerIndex]!,
          isCorrect: value as boolean,
        };
      }
    }

    setEditingQuestion({ ...editingQuestion, answers: updatedAnswers });
  };

  const handleAddAnswer = () => {
    if (!editingQuestion) return;

    setEditingQuestion({
      ...editingQuestion,
      answers: [...editingQuestion.answers, { text: "", isCorrect: false }],
    });
  };

  const handleRemoveAnswer = (answerIndex: number) => {
    if (!editingQuestion || editingQuestion.answers.length <= 2) return;

    const updatedAnswers = editingQuestion.answers.filter(
      (_, index) => index !== answerIndex,
    );
    setEditingQuestion({ ...editingQuestion, answers: updatedAnswers });
  };

  if (isEditing && editingQuestion) {
    return (
      <div className="container mx-auto max-w-4xl p-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {editingQuestion.id ? "Edit Question" : "Create New Question"}
          </h1>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setEditingQuestion(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveQuestion}>
              <Save className="mr-2 h-4 w-4" />
              Save Question
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Question Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Question Type */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Question Type
              </label>
              <Select
                value={editingQuestion.questionType}
                onValueChange={(value: QuestionType) => {
                  let newAnswers = editingQuestion.answers;

                  // Adjust answers structure based on question type
                  if (value === QuestionType.essay) {
                    // Essay questions need exactly one answer (the correct answer)
                    newAnswers = [
                      {
                        id: editingQuestion.answers[0]?.id,
                        text: editingQuestion.answers[0]?.text || "",
                        isCorrect: true,
                      },
                    ];
                  } else if (
                    editingQuestion.questionType === QuestionType.essay
                  ) {
                    // Converting from essay to multiple choice/answer
                    newAnswers = [
                      { text: "", isCorrect: false },
                      { text: "", isCorrect: false },
                    ];
                  }

                  setEditingQuestion({
                    ...editingQuestion,
                    questionType: value,
                    answers: newAnswers,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={QuestionType.mulChoice}>
                    Multiple Choice
                  </SelectItem>
                  <SelectItem value={QuestionType.mulAnswer}>
                    Multiple Answer
                  </SelectItem>
                  <SelectItem value={QuestionType.essay}>Essay</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Score */}
            <div>
              <label className="mb-2 block text-sm font-medium">Score</label>
              <Input
                type="number"
                value={editingQuestion.score}
                onChange={(e) =>
                  setEditingQuestion({
                    ...editingQuestion,
                    score: parseInt(e.target.value) || 0,
                  })
                }
                min="1"
              />
            </div>

            {/* Question Text */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Question Text
              </label>
              <Textarea
                value={editingQuestion.questionText}
                onChange={(e) =>
                  setEditingQuestion({
                    ...editingQuestion,
                    questionText: e.target.value,
                  })
                }
                rows={4}
                placeholder="Enter your question here..."
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Question Image (Optional)
              </label>
              {editingQuestion.imageUrl ? (
                <div className="space-y-2">
                  <Image
                    src={editingQuestion.imageUrl}
                    alt="Question image"
                    width={400}
                    height={300}
                    className="rounded-lg border"
                    onError={(e) => {
                      console.error("Image load error:", e);
                      toast.error("Failed to load image");
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingQuestion((prev) =>
                        prev
                          ? {
                              ...prev,
                              imageUrl: undefined,
                            }
                          : prev,
                      );
                      toast.success("Image removed");
                    }}
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <UploadDropzone
                    className="rounded-lg border"
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => {
                      console.log("Upload complete:", res);
                      const imageUrl = res?.[0]?.url;
                      if (imageUrl) {
                        setEditingQuestion((prev) =>
                          prev
                            ? {
                                ...prev,
                                imageUrl: imageUrl,
                              }
                            : prev,
                        );
                        toast.success("Image uploaded successfully!");
                      } else {
                        console.error("No image URL in response:", res);
                        toast.error(
                          "Upload completed but no image URL received",
                        );
                      }
                    }}
                    onUploadError={(error) => {
                      console.error("Upload error:", error);
                      toast.error(`Upload failed: ${error.message}`);
                    }}
                    onUploadBegin={(name) => {
                      console.log("Upload beginning for file:", name);
                      toast.info("Uploading image...");
                    }}
                    onUploadProgress={(progress) => {
                      console.log("Upload progress:", progress);
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Supported formats: PNG, JPG, JPEG. Max size: 4MB
                  </p>
                </div>
              )}
            </div>

            {/* Essay Answer (only for essay questions) */}
            {editingQuestion.questionType === QuestionType.essay && (
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Correct Answer
                  <span className="ml-2 text-xs text-muted-foreground">
                    (Expected answer for automatic grading)
                  </span>
                </label>
                <Textarea
                  value={editingQuestion.answers[0]?.text || ""}
                  onChange={(e) => {
                    const updatedAnswers = [
                      {
                        id: editingQuestion.answers[0]?.id,
                        text: e.target.value,
                        isCorrect: true,
                      },
                    ];
                    setEditingQuestion({
                      ...editingQuestion,
                      answers: updatedAnswers,
                    });
                  }}
                  rows={3}
                  placeholder="Enter the correct answer for this essay question..."
                />
              </div>
            )}

            {/* Answers (for multiple choice and multiple answer) */}
            {(editingQuestion.questionType === QuestionType.mulChoice ||
              editingQuestion.questionType === QuestionType.mulAnswer) && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium">
                    Answer Options
                    {editingQuestion.questionType ===
                      QuestionType.mulChoice && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (Select exactly one correct answer)
                      </span>
                    )}
                    {editingQuestion.questionType ===
                      QuestionType.mulAnswer && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (Select one or more correct answers)
                      </span>
                    )}
                  </label>
                  <Button variant="outline" size="sm" onClick={handleAddAnswer}>
                    <Plus className="mr-1 h-4 w-4" />
                    Add Answer
                  </Button>
                </div>

                <div className="space-y-3">
                  {editingQuestion.answers.map((answer, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 rounded border p-3"
                    >
                      {editingQuestion.questionType ===
                      QuestionType.mulChoice ? (
                        // Radio button behavior for multiple choice (only one correct)
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={answer.isCorrect}
                          onChange={(e) =>
                            handleAnswerChange(
                              index,
                              "isCorrect",
                              e.target.checked,
                            )
                          }
                          className="h-4 w-4"
                        />
                      ) : (
                        // Checkbox for multiple answer (multiple correct allowed)
                        <Checkbox
                          checked={answer.isCorrect}
                          onCheckedChange={(checked) =>
                            handleAnswerChange(
                              index,
                              "isCorrect",
                              checked as boolean,
                            )
                          }
                        />
                      )}
                      <Input
                        value={answer.text}
                        onChange={(e) =>
                          handleAnswerChange(index, "text", e.target.value)
                        }
                        placeholder={`Answer option ${index + 1}`}
                        className="flex-1"
                      />
                      {editingQuestion.answers.length > 2 && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveAnswer(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Quiz Editor - Subtest {questionsData?.topics?.name}
        </h1>
        <Button onClick={handleNewQuestion}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Question
        </Button>
      </div>

      {questions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="mb-4 text-muted-foreground">
              No questions found for this subtest.
            </p>
            <Button onClick={handleNewQuestion}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Question
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Question Navigation */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))
                }
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentQuestionIndex(
                    Math.min(questions.length - 1, currentQuestionIndex + 1),
                  )
                }
                disabled={currentQuestionIndex === questions.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => handleEditQuestion(currentQuestion)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Question
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  currentQuestion.id && handleDeleteQuestion(currentQuestion.id)
                }
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Question
              </Button>
            </div>
          </div>

          {/* Current Question Display */}
          {currentQuestion && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      {currentQuestion.questionType === QuestionType.mulChoice
                        ? "Multiple Choice"
                        : currentQuestion.questionType ===
                            QuestionType.mulAnswer
                          ? "Multiple Answer"
                          : "Essay"}
                    </Badge>
                    <Badge variant="outline">
                      {currentQuestion.score} points
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Editor
                      key={currentQuestion.id}
                      content={currentQuestion.questionText}
                      isEdit={false}
                    />
                  </div>

                  {/* Display question image if exists */}
                  {currentQuestion.imageUrl && (
                    <div>
                      <Image
                        src={currentQuestion.imageUrl}
                        alt="Question image"
                        width={400}
                        height={300}
                        className="rounded-lg border"
                      />
                    </div>
                  )}

                  {(currentQuestion.questionType === QuestionType.mulChoice ||
                    currentQuestion.questionType ===
                      QuestionType.mulAnswer) && (
                    <div className="space-y-2">
                      <Separator />
                      <h4 className="font-medium">Answer Options:</h4>
                      {currentQuestion.answers.map((answer, index) => (
                        <div
                          key={index}
                          className={`rounded border p-3 ${
                            answer.isCorrect
                              ? "border-green-200 bg-green-50"
                              : "bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            {answer.isCorrect && (
                              <Badge variant="default" className="bg-green-600">
                                Correct
                              </Badge>
                            )}
                            <span>{String.fromCharCode(65 + index)}.</span>
                            <span>{answer.text}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {currentQuestion.questionType === QuestionType.essay && (
                    <div className="space-y-2">
                      <Separator />
                      <h4 className="font-medium">Correct Answer:</h4>
                      <div className="rounded border border-green-200 bg-green-50 p-3">
                        <div className="flex items-center space-x-2">
                          <Badge variant="default" className="bg-green-600">
                            Expected Answer
                          </Badge>
                          <span className="text-sm">
                            {currentQuestion.answers[0]?.text ||
                              "No correct answer set"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Question List Overview */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>All Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {questions.map((question, index) => (
                  <div
                    key={question.id || index}
                    className={`cursor-pointer rounded border p-3 transition-colors ${
                      index === currentQuestionIndex
                        ? "border-blue-500 bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setCurrentQuestionIndex(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Q{index + 1}</span>
                        <span className="max-w-md truncate text-sm text-muted-foreground">
                          {question.questionText
                            .replace(/<[^>]*>/g, "")
                            .substring(0, 50)}
                          ...
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {question.questionType === QuestionType.mulChoice
                            ? "MC"
                            : question.questionType === QuestionType.mulAnswer
                              ? "MA"
                              : "Essay"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {question.score}pts
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
