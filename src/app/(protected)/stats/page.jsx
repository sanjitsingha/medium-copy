'use client'
import React, { useState } from "react";
import StatsLineChart from "@/app/components/StatsLineChart";
const page = () => {


  const [range, setRange] = useState("month");


  // dummy data (later replace with Appwrite stats)
  const stories = [
    {
      id: 1,
      title: "Why consistency beats motivation",
      views: 432,
      reads: 410,
    },
    {
      id: 2,
      title: "I quit overthinking and this happened",
      views: 312,
      reads: 298,
    },
    {
      id: 3,
      title: "Building Open Thoughts in public",
      views: 278,
      reads: 265,
    },
  ];

  const RANGE_OPTIONS = [
    { label: "Today", value: "today" },
    { label: "Last 24 hours", value: "24h" },
    { label: "Last 7 days", value: "7d" },
    { label: "This month", value: "month" },
    { label: "Last 6 months", value: "6m" },
    { label: "Last 1 year", value: "1y" },
  ];
  const RANGE_META = {
    today: {
      title: "Today",
      subtitle: "Today (UTC)",
    },
    "24h": {
      title: "Last 24 hours",
      subtitle: "Last 24 hours (UTC)",
    },
    "7d": {
      title: "Last 7 days",
      subtitle: "Last 7 days (UTC)",
    },
    month: {
      title: "Monthly",
      subtitle: "December 1, 2025 – Today (UTC)",
    },
    "6m": {
      title: "Last 6 months",
      subtitle: "Last 6 months (UTC)",
    },
    "1y": {
      title: "Last 1 year",
      subtitle: "Last 12 months (UTC)",
    },
  };


  // dummy analytics per range
  const statsByRange = {
    today: { views: 54, reads: 49 },
    "24h": { views: 120, reads: 110 },
    "7d": { views: 540, reads: 515 },
    month: { views: 1234, reads: 1225 },
    "6m": { views: 6840, reads: 6602 },
    "1y": { views: 14230, reads: 13910 },
  };
  const { views, reads } = statsByRange[range];
  const readRatio = Math.round((reads / views) * 100);
  const { title, subtitle } = RANGE_META[range];

  return (
    <div className="w-full">
      <div className="max-w-[800px] mx-auto px-4">
        {/* Page Header */}
        <div className="pt-8 border-b border-gray-300 pb-4">
          <p className="text-[22px] font-semibold tracking-tighter">
            Stats
          </p>
        </div>

        {/* Top bar */}
        <div className="w-full flex justify-between mt-10 items-end">
          <div>
            <p className="text-[22px] font-semibold">{title}</p>
            <p className="text-sm text-gray-700">{subtitle}</p>
          </div>

          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="border border-gray-300 p-2 rounded-sm text-sm"
          >
            {RANGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mt-10">
          <div className="p-4 border border-gray-300 rounded">
            <p className="text-sm text-gray-700">Views</p>
            <p className="text-[22px] font-semibold mt-2">{views.toLocaleString()}</p>
          </div>

          <div className="p-4 border border-gray-300 rounded">
            <p className="text-sm text-gray-700">Reads</p>
            <p className="text-[22px] font-semibold mt-2">{reads.toLocaleString()}</p>
          </div>

          <div className="p-4 border border-gray-300 rounded">
            <p className="text-sm text-gray-700">Read ratio</p>
            <p className="text-[22px] font-semibold mt-2">{readRatio}%</p>
          </div>
        </div>

        {/* Graph */}
        <div className="mt-12">
          <p className="text-sm font-semibold mb-3">Views over time</p>
          <div className="border border-gray-300 rounded p-4">
            <StatsLineChart range={range} />
          </div>
        </div>

        {/* Stories stats */}
        <div className="mt-14">
          <p className="text-sm font-semibold mb-4">Your stories</p>

          <div className="space-y-4">
            {stories.map((story) => (
              <div
                key={story.id}
                className="flex justify-between items-center border-b border-gray-200 pb-3"
              >
                <p className="text-sm max-w-[60%] truncate">
                  {story.title}
                </p>

                <div className="flex gap-6 text-sm text-gray-700">
                  <span>{story.views} views</span>
                  <span>{story.reads} reads</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default page;
