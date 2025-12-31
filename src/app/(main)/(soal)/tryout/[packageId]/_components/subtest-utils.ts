export const SUBTEST_ORDER = ["pu", "ppu", "pbm", "pk", "lbi", "lbe", "pm"];

export const SUBTEST_NAMES = {
  pu: { short: "PU", full: "Kemampuan Penalaran Umum" },
  ppu: { short: "PPU", full: "Pengetahuan dan Pemahaman Umum" },
  pbm: { short: "PBM", full: "Kemampuan Memahami Bacaan dan Menulis" },
  pk: { short: "PK", full: "Pengetahuan Kuantitatif" },
  lbi: { short: "LBI", full: "Literasi dalam Bahasa Indonesia" },
  lbe: { short: "LBE", full: "Literasi dalam Bahasa Inggris" },
  pm: { short: "PM", full: "Penalaran Matematika" },
} as const;

export function getSubtestDisplayName(type: string) {
  if (type in SUBTEST_NAMES) {
    return SUBTEST_NAMES[type as keyof typeof SUBTEST_NAMES];
  }

  const formatted = type
    .replace("_", " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return { short: formatted, full: formatted };
}

export function sortSubtests<T extends { type?: string }>(subtests: T[]): T[] {
  return [...subtests].sort((a, b) => {
    const indexA = a.type ? SUBTEST_ORDER.indexOf(a.type) : -1;
    const indexB = b.type ? SUBTEST_ORDER.indexOf(b.type) : -1;
    return indexA - indexB;
  });
}

export function isSubtestCompleted(subtest: {
  quizSession?: Array<{ endTime?: Date | string | null }>;
}): boolean {
  return !!(
    subtest.quizSession?.[0]?.endTime &&
    new Date(subtest.quizSession[0].endTime) <= new Date()
  );
}

export function getCompletedCount<
  T extends { quizSession?: Array<{ endTime?: Date | string | null }> },
>(subtests: T[]): number {
  return subtests.filter((s) => isSubtestCompleted(s)).length;
}
