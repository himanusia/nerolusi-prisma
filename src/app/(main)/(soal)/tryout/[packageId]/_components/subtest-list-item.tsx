"use client";

import { Button } from "~/app/_components/ui/button";
import { getSubtestDisplayName } from "./subtest-utils";

interface SubtestListItemProps {
  subtest: {
    id?: string;
    type?: string;
    duration?: number;
    quizSession?: Array<{
      endTime?: Date | string | null;
      score?: number | null;
      numCorrect?: number | null;
      numQuestion?: number | null;
    }>;
  };
  isSubmitted: boolean;
  isCurrentSubtest: boolean;
  isPackageEndDatePassed: boolean;
  onClick: () => void;
}

export function SubtestListItem({
  subtest,
  isSubmitted,
  isCurrentSubtest,
  isPackageEndDatePassed,
  onClick,
}: SubtestListItemProps) {
  const subtestName = getSubtestDisplayName(subtest.type || "");

  return (
    <Button
      variant={
        isSubmitted ? "default" : isCurrentSubtest ? "outline" : "disable"
      }
      className={`h-auto min-h-10 w-full items-center justify-center whitespace-normal rounded-lg transition-all ${
        isSubmitted || isCurrentSubtest
          ? "cursor-pointer"
          : "pointer-events-none"
      }`}
      onClick={onClick}
    >
      <div className="w-full text-center">
        <div className="text-md font-bold">{subtestName.full}</div>
        {isPackageEndDatePassed &&
          isSubmitted &&
          (subtest.quizSession?.[0]?.score !== null ||
            subtest.quizSession?.[0]?.score !== undefined) && (
            <div className="text-sm opacity-90">
              Score: {subtest.quizSession[0].score} |{" "}
              {subtest.quizSession[0].numCorrect}/
              {subtest.quizSession[0].numQuestion}
            </div>
          )}
      </div>
    </Button>
  );
}
