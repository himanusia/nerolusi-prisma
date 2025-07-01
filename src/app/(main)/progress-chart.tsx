"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../_components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

// Dummy data for the progress chart
const chartData = [
  { test: "Test 1", score: 420 },
  { test: "Test 2", score: 380 },
  { test: "Test 3", score: 520 },
  { test: "Test 4", score: 490 },
  { test: "Test 5", score: 490 },
];

// Score targets data

const chartConfig = {
  score: {
    label: "Score",
    color: "#22c55e", // Green color for the line
  },
};

export default function ProgressChart() {
  return (
    <div className="flex h-full w-full shrink-0 flex-col flex-wrap gap-6 rounded-lg bg-gradient-to-b from-[#2b8057] to-[#32b274] p-6 md:h-96 md:w-fit">
      {/* Chart Section */}
      <div className="h-full w-full rounded-lg bg-white p-6 md:w-fit flex items-center justify-center">
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
        <h2 className="mb-2 lg:text-lg font-extrabold text-white">Skor TO mu!</h2>
        <div className="flex size-full flex-row gap-3 overflow-x-scroll md:overflow-x-hidden rounded-lg bg-white p-4 scrollbar-thin scrollbar-track-transparent scrollbar-corner-transparent md:flex-col md:overflow-y-scroll">
          {chartData.map((item, index) => (
            <div
              key={index}
              className="flex w-20 shrink-0 items-center justify-between rounded-lg border bg-gray-50 p-3"
            >
              <span className="text-xl font-bold">{item.score}</span>
              <span className="text-lg text-gray-500">{">"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
