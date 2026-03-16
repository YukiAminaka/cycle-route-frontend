"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const data = [
  { month: "3月", value: 210 },
  { month: "4月", value: 168 },
  { month: "5月", value: 145 },
  { month: "6月", value: 120 },
  { month: "7月", value: 89 },
  { month: "8月", value: 34 },
  { month: "9月", value: 68 },
  { month: "10月", value: 0 },
  { month: "11月", value: 0 },
  { month: "12月", value: 0 },
  { month: "1月", value: 0 },
  { month: "2月", value: 0 },
  { month: "2025年3月", value: 0 },
  { month: "3月", value: 0 },
];

export function ActivityChart() {
  return (
    <ResponsiveContainer width="100%" height={140}>
      <BarChart data={data} margin={{ top: 8, right: 0, left: -32, bottom: 0 }}>
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: "#757575" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#757575" }}
          axisLine={false}
          tickLine={false}
          ticks={[0, 34, 89, 120, 168, 210]}
        />
        <Tooltip
          contentStyle={{ fontSize: 12 }}
          formatter={(v) => [`${v} km`, "距離"]}
        />
        <Bar dataKey="value" fill="#4FC3F7" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
