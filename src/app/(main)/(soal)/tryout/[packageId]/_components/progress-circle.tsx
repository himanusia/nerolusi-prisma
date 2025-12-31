"use client";

interface ProgressCircleProps {
  completed: number;
  total: number;
}

export function ProgressCircle({ completed, total }: ProgressCircleProps) {
  const percentage = total > 0 ? (completed / total) * 251.2 : 0;

  return (
    <div className="mb-4 flex items-center justify-center">
      <div className="relative h-32 w-32">
        <svg className="h-32 w-32 -rotate-90 transform" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="#d4ffea"
            strokeWidth="20"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="#2b8057"
            strokeWidth="20"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${percentage} 251.2`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-800">
            {completed}/{total}
          </span>
        </div>
      </div>
    </div>
  );
}
