// src/lib/types/packageTypes.ts

import { Type, SubtestType, QuestionType } from "@prisma/client";

// Tipe untuk Jawaban
export interface Answer {
  id?: number;
  index: number;
  content: string;
}

// Tipe untuk Pertanyaan
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

// Tipe untuk Subtest
export interface Subtest {
  id?: number;
  type: SubtestType;
  duration: number;
  questions: Question[];
}

// Tipe untuk Form Data Paket (Create dan Update)
export interface PackageFormData {
  id?: number;
  name: string;
  type: Type;
  classId: number;
  TOstart: string;
  TOend: string;
  subtests: Subtest[];
}

// Tipe untuk Paket yang Diambil dari Backend (Semua Field Wajib)
export interface Package extends PackageFormData {
  id: number;
}
