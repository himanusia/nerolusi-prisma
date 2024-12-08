"use client";

import React, { useState } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SubtestType, QuestionType, Type } from "@prisma/client";
import { Input } from "~/app/_components/ui/input";
import { Button } from "~/app/_components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/app/_components/ui/popover";
import {
  Command,
  CommandItem,
  CommandList,
} from "~/app/_components/ui/command";
import { Textarea } from "~/app/_components/ui/textarea";
import { UploadButton } from "~/utils/uploadthing";
import Image from "next/image";

export default function CreatePackagePage() {
  const router = useRouter();
  const createPackageMutation = api.package.createPackage.useMutation({
    onSuccess: () => {
      toast.success("Package created successfully!");
      router.push("/packageManagement");
    },
    onError: (error: any) => {
      console.error("Error:", error);
      toast.error("Failed to create package.");
    },
  });

  const [formData, setFormData] = useState<{
    name: string;
    type: Type;
    classId: number;
    TOstart: string;
    TOend: string;
    subtests: {
      type: SubtestType;
      duration: string;
      questions: {
        index: number;
        content: string;
        imageUrl: string;
        type: QuestionType;
        score: number;
        explanation: string;
        answers: { index: number; content: string }[];
        correctAnswerChoice?: number;
      }[];
    }[];
  }>({
    name: "",
    type: "tryout",
    classId: 1,
    TOstart: "",
    TOend: "",
    subtests: [
      {
        type: "pu",
        duration: "",
        questions: [
          {
            index: 1,
            content: "",
            imageUrl: "",
            type: "mulChoice", // Default type as multiple choice
            score: 0,
            explanation: "",
            answers: [
              { index: 1, content: "" },
              { index: 2, content: "" },
              { index: 3, content: "" },
              { index: 4, content: "" },
            ],
            correctAnswerChoice: 1,
          },
        ],
      },
    ],
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubtestChange = (index: number, field: string, value: any) => {
    const updatedSubtests = [...formData.subtests];
    if (updatedSubtests[index]) {
      if (field in updatedSubtests[index]) {
        (updatedSubtests[index] as any)[field] = value;
      }
    }
    setFormData((prev) => ({ ...prev, subtests: updatedSubtests }));
  };

  const handleQuestionChange = (
    subtestIndex: number,
    questionIndex: number,
    field: string,
    value: any,
  ) => {
    const updatedSubtests = [...formData.subtests];
    if (
      updatedSubtests[subtestIndex] &&
      updatedSubtests[subtestIndex].questions[questionIndex]
    ) {
      (updatedSubtests[subtestIndex].questions[questionIndex] as any)[field] =
        value;
    }

    if (field === "type" && value === "essay") {
      updatedSubtests[subtestIndex].questions[questionIndex].answers = [
        { index: 1, content: "" },
      ];
      updatedSubtests[subtestIndex].questions[
        questionIndex
      ].correctAnswerChoice = 0;
    }

    setFormData((prev) => ({ ...prev, subtests: updatedSubtests }));
  };

  const handleAnswerChange = (
    subtestIndex: number,
    questionIndex: number,
    answerIndex: number,
    value: string,
  ) => {
    const updatedSubtests = [...formData.subtests];
    if (
      updatedSubtests[subtestIndex] &&
      updatedSubtests[subtestIndex].questions[questionIndex] &&
      updatedSubtests[subtestIndex].questions[questionIndex].answers[
        answerIndex
      ]
    ) {
      updatedSubtests[subtestIndex].questions[questionIndex].answers[
        answerIndex
      ].content = value;
      setFormData((prev) => ({ ...prev, subtests: updatedSubtests }));
    }
  };

  const handleCorrectAnswerChoiceChange = (
    subtestIndex: number,
    questionIndex: number,
    answerIndex: number,
  ) => {
    const updatedSubtests = [...formData.subtests];
    if (
      updatedSubtests[subtestIndex] &&
      updatedSubtests[subtestIndex].questions[questionIndex]
    ) {
      updatedSubtests[subtestIndex].questions[
        questionIndex
      ].correctAnswerChoice = answerIndex;
    }
    setFormData((prev) => ({ ...prev, subtests: updatedSubtests }));
  };

  const addSubtest = () => {
    setFormData((prev) => ({
      ...prev,
      subtests: [
        ...prev.subtests,
        {
          type: "pu",
          duration: "",
          questions: [
            {
              index: 1,
              content: "",
              imageUrl: "",
              type: "mulChoice",
              score: 0,
              explanation: "",
              answers: [
                { index: 1, content: "" },
                { index: 2, content: "" },
                { index: 3, content: "" },
                { index: 4, content: "" },
              ],
              correctAnswerChoice: 1,
            },
          ],
        },
      ],
    }));
  };

  const addQuestion = (subtestIndex: number) => {
    const updatedSubtests = [...formData.subtests];
    updatedSubtests[subtestIndex].questions.push({
      index: updatedSubtests[subtestIndex].questions.length + 1,
      content: "",
      imageUrl: "",
      type: "mulChoice", // Default question type as multiple choice
      score: 0,
      explanation: "",
      answers: [
        { index: 1, content: "" },
        { index: 2, content: "" },
        { index: 3, content: "" },
        { index: 4, content: "" },
      ],
      correctAnswerChoice: 1,
    });
    setFormData((prev) => ({ ...prev, subtests: updatedSubtests }));
  };

  const addAnswer = (
    subtestIndex: number,
    questionIndex: number,
    answerIndex: number,
  ) => {
    const updatedSubtests = [...formData.subtests];
    updatedSubtests[subtestIndex].questions[questionIndex].answers.push({
      index:
        updatedSubtests[subtestIndex].questions[questionIndex].answers.length +
        1,
      content: "",
    });
    setFormData((prev) => ({ ...prev, subtests: updatedSubtests }));
  };

  const removeAnswer = (
    subtestIndex: number,
    questionIndex: number,
    answerIndex: number,
  ) => {
    const updatedSubtests = [...formData.subtests];
    updatedSubtests[subtestIndex].questions[questionIndex].answers.splice(
      answerIndex,
      1,
    );
    setFormData((prev) => ({ ...prev, subtests: updatedSubtests }));
  };

  const removeQuestion = (subtestIndex: number, questionIndex: number) => {
    const updatedSubtests = [...formData.subtests];
    updatedSubtests[subtestIndex].questions.splice(questionIndex, 1);
    setFormData((prev) => ({ ...prev, subtests: updatedSubtests }));
  };

  const removeSubtest = (subtestIndex: number) => {
    const updatedSubtests = [...formData.subtests];
    updatedSubtests.splice(subtestIndex, 1);
    setFormData((prev) => ({ ...prev, subtests: updatedSubtests }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedFormData = {
      ...formData,
      TOstart: formData.TOstart ? new Date(formData.TOstart).toISOString() : "",
      TOend: formData.TOend ? new Date(formData.TOend).toISOString() : "",
    };

    if (!formData.name.trim()) {
      toast.error("Name is required.");
      return;
    }

    try {
      await createPackageMutation.mutateAsync(updatedFormData);
    } catch (error) {
      console.error("Error creating package:", error);
    }
  };

  return (
    <div>
      <h1 className="flex justify-center text-2xl font-semibold">
        Create Package
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label>
          Name:
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </label>
        <label className="flex w-fit">
          <p>Type:</p>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">{formData.type}</Button>
            </PopoverTrigger>
            <PopoverContent className="w-full">
              <Command>
                <CommandList>
                  <CommandItem onSelect={() => handleChange("type", "tryout")}>
                    Tryout
                  </CommandItem>
                  <CommandItem onSelect={() => handleChange("type", "drill")}>
                    Drill
                  </CommandItem>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </label>
        <label className="flex w-fit">
          <p className="w-fit">Start Date:</p>
          <Input
            type="datetime-local"
            value={formData.TOstart}
            onChange={(e) => handleChange("TOstart", e.target.value)}
          />
        </label>
        <label className="flex w-fit">
          <p className="w-fit">End Date:</p>
          <Input
            type="datetime-local"
            value={formData.TOend}
            onChange={(e) => handleChange("TOend", e.target.value)}
          />
        </label>
        {/* Subtests */}
        {formData.subtests.map((subtest, sIndex) => (
          <div
            key={sIndex}
            className="flex flex-col gap-3 rounded-xl border p-6"
          >
            <h3 className="text-xl font-semibold">Subtest {sIndex + 1}</h3>
            <label className="w-fit">
              Subtest Type:
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">{subtest.type}</Button>
                </PopoverTrigger>
                <PopoverContent className="w-full">
                  <Command>
                    <CommandList>
                      {Object.values(SubtestType).map((type) => (
                        <CommandItem
                          key={type}
                          onSelect={() =>
                            handleSubtestChange(sIndex, "type", type)
                          }
                        >
                          {type}
                        </CommandItem>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </label>
            <label className="flex w-32">
              Duration (minutes):
              <Input
                type="number"
                min="0"
                value={subtest.duration}
                onChange={(e) =>
                  handleSubtestChange(sIndex, "duration", e.target.value)
                }
              />
            </label>
            <h4 className="text-lg font-semibold">Questions</h4>
            {subtest.questions.map((question, qIndex) => (
              <div
                key={qIndex}
                className="flex flex-col gap-3 rounded-lg border p-3"
              >
                <h4 className="font-semibold">Questions {qIndex + 1}</h4>
                <div>
                  <label>Content: </label>
                  <Textarea
                    value={question.content}
                    onChange={(e) =>
                      handleQuestionChange(
                        sIndex,
                        qIndex,
                        "content",
                        e.target.value,
                      )
                    }
                  />
                </div>
                <div>
                  <label>Explanation: </label>
                  <Textarea
                    value={question.explanation}
                    onChange={(e) =>
                      handleQuestionChange(
                        sIndex,
                        qIndex,
                        "explanation",
                        e.target.value,
                      )
                    }
                  />
                </div>
                <div>
                  <label>Image Upload: </label>
                  <UploadButton
                    className="rounded-lg border"
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) =>
                      handleQuestionChange(
                        sIndex,
                        qIndex,
                        "imageUrl",
                        res?.[0]?.url,
                      )
                    }
                  />
                  {question.imageUrl && (
                    <Image
                      src={question.imageUrl}
                      alt={question.imageUrl}
                      width={300}
                      height={300}
                    />
                  )}
                </div>
                <label className="w-fit">
                  Question Type:
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">{question.type}</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full">
                      <Command>
                        <CommandList>
                          <CommandItem
                            onSelect={() =>
                              handleQuestionChange(
                                sIndex,
                                qIndex,
                                "type",
                                "mulChoice",
                              )
                            }
                          >
                            Multiple Choice
                          </CommandItem>
                          <CommandItem
                            onSelect={() =>
                              handleQuestionChange(
                                sIndex,
                                qIndex,
                                "type",
                                "essay",
                              )
                            }
                          >
                            Essay
                          </CommandItem>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </label>
                {question.type === "mulChoice" && (
                  <div className="flex flex-col gap-3">
                    <h5>Answers</h5>
                    {question.answers.map((answer, aIndex) => (
                      <div key={aIndex} className="flex gap-2">
                        {String.fromCharCode(65 + aIndex)}.
                        <Textarea
                          value={answer.content}
                          onChange={(e) =>
                            handleAnswerChange(
                              sIndex,
                              qIndex,
                              aIndex,
                              e.target.value,
                            )
                          }
                        />
                        <label>
                          <Input
                            type="radio"
                            checked={
                              question.correctAnswerChoice === aIndex + 1
                            }
                            onChange={() =>
                              handleCorrectAnswerChoiceChange(
                                sIndex,
                                qIndex,
                                aIndex + 1,
                              )
                            }
                          />
                        </label>
                        <Button
                          type="button"
                          onClick={() => removeAnswer(sIndex, qIndex, aIndex)}
                        >
                          Remove Answer
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      onClick={() =>
                        addAnswer(sIndex, qIndex, question.answers.length + 1)
                      }
                    >
                      Add Answer
                    </Button>
                  </div>
                )}
                {question.type === "essay" && (
                  <div>
                    <label>Essay Answer:</label>
                    <Textarea
                      value={question.answers[0]?.content ?? ""}
                      onChange={(e) =>
                        handleAnswerChange(sIndex, qIndex, 0, e.target.value)
                      }
                    />
                  </div>
                )}
                <Button
                  type="button"
                  onClick={() => removeQuestion(sIndex, qIndex)}
                >
                  Remove Question
                </Button>
              </div>
            ))}
            <Button
              type="button"
              onClick={() => addQuestion(sIndex)}
              className="w-full"
            >
              Add Question
            </Button>
            <Button
              type="button"
              onClick={() => removeSubtest(sIndex)}
              className="w-full"
            >
              Remove Subtest
            </Button>
          </div>
        ))}
        <Button type="button" onClick={addSubtest}>
          Add Subtest
        </Button>
        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
}
