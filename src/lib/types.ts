import { Type, SubtestType, QuestionType } from "@prisma/client";

export interface Answer {
  id?: number;
  index: number;
  content: string;
}

export interface Question {
  id?: number;
  index: number;
  content: string;
  imageUrl?: string;
  type: QuestionType;
  score: number;
  explanation?: string;
  answers: Answer[];
  correctAnswerChoice?: number;
}

export interface Subtest {
  id?: number;
  type: SubtestType;
  duration: number;
  questions: Question[];
}

export interface PackageFormData {
  id?: number;
  name: string;
  type: Type;
  classId: number;
  TOstart: string;
  TOend: string;
  subtests: Subtest[];
}

export interface Package extends PackageFormData {
  id: number;
}
