"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/app/_components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { api } from "~/trpc/react";
import { format } from "date-fns";
import Link from "next/link";

const chartConfig = {
  score: {
    label: "Score",
    color: "#22c55e", // Green color for the line
  },
};

export default function ProgressChart() {
  const { data: packages, isLoading } = api.quiz.getPastScores.useQuery({
    limit: 10,
  });

  const chartData =
    packages?.map((pkg, index) => ({
      id: pkg.id,
      test: pkg.name || `Test ${index + 1}`,
      score: pkg.averageScore || 0,
      date: pkg.endTime ? format(new Date(pkg.endTime), "MMM dd") : "",
    })) || [];

  if (isLoading) {
    return (
      <div className="flex h-full w-full shrink-0 flex-col flex-wrap gap-6 rounded-lg bg-gradient-to-b from-[#2b8057] to-[#32b274] p-6 md:h-96 md:w-fit">
        <div className="flex h-full w-full items-center justify-center rounded-lg bg-white p-6 md:w-fit">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="flex h-full w-full shrink-0 flex-col flex-wrap gap-6 rounded-lg bg-gradient-to-b from-[#2b8057] to-[#32b274] p-6 md:h-96 md:w-fit">
        <div className="flex h-full w-full items-center justify-center rounded-lg bg-white p-6 md:w-fit">
          <p className="text-gray-500">Belum ada tryout yang diselesaikan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full shrink-0 flex-col flex-wrap gap-6 rounded-lg bg-gradient-to-b from-[#2b8057] to-[#32b274] p-6 md:h-96 md:w-fit">
      {/* Chart Section */}
      <div className="flex h-full w-full items-center justify-center rounded-lg bg-white p-6 md:w-fit">
        <ChartContainer config={chartConfig} className="h-72 w-full">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 15, left: -15, bottom: -10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="test"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6b7280" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              domain={[300, 600]}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="score"
              stroke="var(--color-score)"
              strokeWidth={3}
              dot={{ fill: "var(--color-score)", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
      </div>

      {/* Score Targets Section */}
      <div className="flex size-full flex-col items-center overflow-hidden md:w-28 lg:w-32">
        <h2 className="mb-2 font-extrabold text-white lg:text-lg">
          Skor TO mu!
        </h2>
        <div className="flex size-full flex-row gap-3 overflow-x-scroll rounded-lg bg-white p-4 scrollbar-thin scrollbar-track-transparent scrollbar-corner-transparent md:flex-col md:overflow-x-hidden md:overflow-y-scroll">
          {chartData.map((item, index) => (
            <Link
              key={index}
              href={`/tryout/${item.id}/scores`}
              className="flex w-20 shrink-0 items-center justify-between rounded-lg border bg-gray-50 p-3 transition-colors hover:bg-gray-100"
            >
              <span className="text-xl font-bold">{item.score}</span>
              <span className="text-lg text-gray-500">{">"}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
