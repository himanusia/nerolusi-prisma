"use client";

import React, { useState } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SubtestType, QuestionType, Type } from "@prisma/client";

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
      updatedSubtests[subtestIndex].questions[questionIndex].answers = [];
      updatedSubtests[subtestIndex].questions[
        questionIndex
      ].correctAnswerChoice = undefined;
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
      <h1>Create Package</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </label>
        <label>
          Type:
          <select
            value={formData.type}
            onChange={(e) => handleChange("type", e.target.value)}
          >
            <option value="tryout">Tryout</option>
            <option value="drill">Drill</option>
          </select>
        </label>
        <label>
          Start Date:
          <input
            type="datetime-local"
            value={formData.TOstart}
            onChange={(e) => handleChange("TOstart", e.target.value)}
          />
        </label>
        <label>
          End Date:
          <input
            type="datetime-local"
            value={formData.TOend}
            onChange={(e) => handleChange("TOend", e.target.value)}
          />
        </label>
        {/* Subtests */}
        {formData.subtests.map((subtest, sIndex) => (
          <div key={sIndex}>
            <h3>Subtest {sIndex + 1}</h3>
            <label>
              Subtest Type:
              <select
                value={subtest.type}
                onChange={(e) =>
                  handleSubtestChange(sIndex, "type", e.target.value)
                }
              >
                {Object.values(SubtestType).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Duration:
              <input
                type="number"
                min="0"
                value={subtest.duration}
                onChange={(e) =>
                  handleSubtestChange(sIndex, "duration", e.target.value)
                }
              />
            </label>
            <h4>Questions</h4>
            {subtest.questions.map((question, qIndex) => (
              <div key={qIndex}>
                <label>Content:</label>
                <textarea
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
                <label>
                  Question Type:
                  <select
                    value={question.type}
                    onChange={(e) =>
                      handleQuestionChange(
                        sIndex,
                        qIndex,
                        "type",
                        e.target.value,
                      )
                    }
                  >
                    <option value="mulChoice">Multiple Choice</option>
                    <option value="essay">Essay</option>
                  </select>
                </label>
                {question.type === "mulChoice" && (
                  <div>
                    <h5>Answers</h5>
                    {question.answers.map((answer, aIndex) => (
                      <div key={aIndex}>
                        <input
                          type="text"
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
                          <input
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
                          Correct Answer
                        </label>
                        <button
                          type="button"
                          onClick={() => removeAnswer(sIndex, qIndex, aIndex)}
                        >
                          Remove Answer
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        addAnswer(sIndex, qIndex, question.answers.length + 1)
                      }
                    >
                      Add Answer
                    </button>
                  </div>
                )}
                {question.type === "essay" && (
                  <div>
                    <label>Essay Answer:</label>
                    <textarea
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
                )}
                <button
                  type="button"
                  onClick={() => removeQuestion(sIndex, qIndex)}
                >
                  Remove Question
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addQuestion(sIndex)}>
              Add Question
            </button>
            <button type="button" onClick={() => removeSubtest(sIndex)}>
              Remove Subtest
            </button>
          </div>
        ))}
        <button type="button" onClick={addSubtest}>
          Add Subtest
        </button>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
