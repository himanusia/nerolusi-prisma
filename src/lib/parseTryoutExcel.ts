import ExcelJS from "exceljs";
import { QuestionType, SubtestType } from "@prisma/client";

export interface ParsedQuestion {
  content: string;
  type: QuestionType;
  score: number;
  imageUrl?: string;
  imageBuffer?: { buffer: Buffer; extension: string };
  explanation?: string;
  videoExplanation?: string;
  answers: { content: string; isCorrect: boolean }[];
}

export interface ParsedSubtest {
  type: SubtestType;
  duration: number;
  questions: ParsedQuestion[];
}

export interface ParseResult {
  subtests: ParsedSubtest[];
  errors: string[];
}

const VALID_SUBTEST_TYPES = Object.values(SubtestType) as string[];
const VALID_QUESTION_TYPES = Object.values(QuestionType) as string[];
const LETTERS = ["A", "B", "C", "D", "E"];
const IMAGE_COLUMN_INDEX = 4; // kolom E (URLGambar), 0-indexed sesuai exceljs nativeCol

/**
 * Berjalan di SERVER (Node.js). Buffer di sini adalah Buffer Node biasa,
 * bukan File browser -- fungsi ini dipanggil dari dalam mutation tRPC,
 * setelah file excel mentah sudah di-fetch dari UploadThing.
 */
export async function parseTryoutExcel(buffer: Buffer): Promise<ParseResult> {
  const errors: string[] = [];
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const subtestSheet = workbook.getWorksheet("Subtests");
  const soalSheet = workbook.getWorksheet("Soal");

  if (!subtestSheet) errors.push("Sheet 'Subtests' tidak ditemukan di file ini.");
  if (!soalSheet) errors.push("Sheet 'Soal' tidak ditemukan di file ini.");
  if (errors.length > 0) return { subtests: [], errors };

  // Peta baris (1-indexed) -> gambar embedded, khusus sheet 'Soal' kolom E
  const imagesByRow = new Map<number, { buffer: Buffer; extension: string }>();
  for (const image of soalSheet!.getImages()) {
    const col = Math.round(image.range.tl.nativeCol);
    const row = Math.round(image.range.tl.nativeRow); // 0-indexed
    if (col !== IMAGE_COLUMN_INDEX) continue;
    const media = (workbook.model as any).media?.find(
      (m: any) => m.index === image.imageId,
    );
    if (!media) continue;
    imagesByRow.set(row + 1, {
      buffer: media.buffer as Buffer,
      extension: media.extension as string,
    });
  }

  // ---------- Sheet: Subtests ----------
  const subtestMap = new Map<string, ParsedSubtest>();
  subtestSheet!.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const typeRaw = row.getCell(1).text?.trim();
    const durationRaw = row.getCell(2).value;
    if (!typeRaw) return;

    if (!VALID_SUBTEST_TYPES.includes(typeRaw)) {
      errors.push(
        `Sheet 'Subtests' baris ${rowNumber}: SubtestType '${typeRaw}' tidak dikenali.`,
      );
      return;
    }
    const duration = Number(durationRaw);
    if (!durationRaw || Number.isNaN(duration) || duration <= 0) {
      errors.push(
        `Sheet 'Subtests' baris ${rowNumber}: Duration_menit harus angka positif.`,
      );
      return;
    }
    if (subtestMap.has(typeRaw)) {
      errors.push(
        `Sheet 'Subtests' baris ${rowNumber}: SubtestType '${typeRaw}' sudah didaftarkan sebelumnya (duplikat).`,
      );
      return;
    }
    subtestMap.set(typeRaw, { type: typeRaw as SubtestType, duration, questions: [] });
  });

  // ---------- Sheet: Soal ----------
  soalSheet!.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const subtestType = row.getCell(1).text?.trim();
    const questionType = row.getCell(2).text?.trim();
    const content = row.getCell(3).text?.trim();
    const scoreRaw = row.getCell(4).value;
    const imageUrlText = row.getCell(5).text?.trim() || undefined;
    const explanation = row.getCell(6).text?.trim() || undefined;
    const videoExplanation = row.getCell(7).text?.trim() || undefined;
    const answerTexts = [8, 9, 10, 11, 12].map(
      (c) => row.getCell(c).text?.trim() || "",
    );
    const correctRaw = row.getCell(13).text?.trim();

    if (!subtestType && !content) return;

    const rowLabel = `Sheet 'Soal' baris ${rowNumber}`;

    if (!subtestType) {
      errors.push(`${rowLabel}: SubtestType kosong.`);
      return;
    }
    if (!subtestMap.has(subtestType)) {
      errors.push(
        `${rowLabel}: SubtestType '${subtestType}' belum didaftarkan di sheet 'Subtests'.`,
      );
      return;
    }
    if (!questionType || !VALID_QUESTION_TYPES.includes(questionType)) {
      errors.push(
        `${rowLabel}: TipeSoal '${questionType}' tidak dikenali (harus essay/mulChoice/mulAnswer).`,
      );
      return;
    }
    if (!content) {
      errors.push(`${rowLabel}: Konten soal kosong.`);
      return;
    }

    const score = Number(scoreRaw);
    if (
      scoreRaw === null ||
      scoreRaw === undefined ||
      Number.isNaN(score) ||
      score < 0
    ) {
      errors.push(`${rowLabel}: Skor harus angka >= 0.`);
      return;
    }

    if (!correctRaw) {
      errors.push(`${rowLabel}: Kolom JawabanBenar kosong.`);
      return;
    }

    const answers: { content: string; isCorrect: boolean }[] = [];

    if (questionType === "essay") {
      if (!answerTexts[0]) {
        errors.push(
          `${rowLabel}: Untuk tipe essay, JawabanA (kunci jawaban) wajib diisi.`,
        );
        return;
      }
      answers.push({ content: answerTexts[0], isCorrect: true });
    } else {
      const filledLetters = LETTERS.filter((_, i) => answerTexts[i]);
      if (filledLetters.length < 2) {
        errors.push(
          `${rowLabel}: Minimal 2 pilihan jawaban (JawabanA-E) harus diisi.`,
        );
        return;
      }
      const correctLetters = correctRaw
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);

      if (questionType === "mulChoice" && correctLetters.length !== 1) {
        errors.push(
          `${rowLabel}: TipeSoal mulChoice harus punya TEPAT SATU JawabanBenar (contoh: B).`,
        );
        return;
      }
      const invalid = correctLetters.filter((l) => !filledLetters.includes(l));
      if (invalid.length > 0) {
        errors.push(
          `${rowLabel}: JawabanBenar berisi huruf '${invalid.join(", ")}' yang tidak merujuk ke opsi jawaban manapun.`,
        );
        return;
      }
      LETTERS.forEach((letter, i) => {
        if (!answerTexts[i]) return;
        answers.push({
          content: answerTexts[i],
          isCorrect: correctLetters.includes(letter),
        });
      });
    }

    const question: ParsedQuestion = {
      content,
      type: questionType as QuestionType,
      score,
      explanation,
      videoExplanation,
      answers,
    };

    const embeddedImage = imagesByRow.get(rowNumber);
    if (imageUrlText) {
      question.imageUrl = imageUrlText;
    } else if (embeddedImage) {
      question.imageBuffer = embeddedImage;
    }

    subtestMap.get(subtestType)!.questions.push(question);
  });

  for (const [type, s] of subtestMap.entries()) {
    if (s.questions.length === 0) {
      errors.push(
        `Subtest '${type}' terdaftar di sheet 'Subtests' tapi tidak ditemukan soalnya di sheet 'Soal'.`,
      );
    }
  }

  return { subtests: Array.from(subtestMap.values()), errors };
}