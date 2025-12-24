"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function StatsLineChart({ range }) {
  const chartDataMap = {
    today: [
      { label: "Morning", views: 12 },
      { label: "Afternoon", views: 18 },
      { label: "Evening", views: 24 },
    ],
    "24h": [
      { label: "0–6", views: 30 },
      { label: "6–12", views: 40 },
      { label: "12–18", views: 25 },
      { label: "18–24", views: 55 },
    ],
    "7d": [
      { label: "Mon", views: 80 },
      { label: "Tue", views: 120 },
      { label: "Wed", views: 90 },
      { label: "Thu", views: 140 },
      { label: "Fri", views: 110 },
      { label: "Sat", views: 160 },
      { label: "Sun", views: 180 },
    ],
    month: [
      { label: "Week 1", views: 220 },
      { label: "Week 2", views: 320 },
      { label: "Week 3", views: 280 },
      { label: "Week 4", views: 410 },
    ],
    "6m": [
      { label: "Jul", views: 800 },
      { label: "Aug", views: 1200 },
      { label: "Sep", views: 980 },
      { label: "Oct", views: 1400 },
      { label: "Nov", views: 1600 },
      { label: "Dec", views: 1800 },
    ],
    "1y": [
      { label: "Jan", views: 900 },
      { label: "Mar", views: 1200 },
      { label: "May", views: 1600 },
      { label: "Jul", views: 2000 },
      { label: "Sep", views: 2400 },
      { label: "Dec", views: 2800 },
    ],
  };

  const chartData = chartDataMap[range] || chartDataMap.month;

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="views"
            stroke="#111827"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
