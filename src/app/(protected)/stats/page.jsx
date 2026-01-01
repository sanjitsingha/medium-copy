"use client";

import React, { useEffect, useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import StatsLineChart from "@/app/components/StatsLineChart";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { MdOutlineNavigateNext } from "react-icons/md";

const DATABASE_ID = "693d3d220017a846a1c0";
const ARTICLES_COLLECTION = "articles";
const STORIES_PER_PAGE = 4;

const Page = () => {
  const { user } = useAuthContext();

  /* ---------------- STATE ---------------- */
  const [stories, setStories] = useState([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [range, setRange] = useState("month");
  const [pageIndex, setPageIndex] = useState(1);

  /* ---------------- PAGINATION ---------------- */
  const totalPages = Math.ceil(stories.length / STORIES_PER_PAGE);

  const paginatedStories = stories.slice(
    (pageIndex - 1) * STORIES_PER_PAGE,
    pageIndex * STORIES_PER_PAGE
  );

  /* Reset pagination on range change */
  useEffect(() => {
    setPageIndex(1);
  }, [range]);

  /* ---------------- FETCH USER STORIES ---------------- */
  useEffect(() => {
    if (!user) return;

    const fetchUserStories = async () => {
      try {
        const res = await databases.listDocuments(
          DATABASE_ID,
          ARTICLES_COLLECTION,
          [
            Query.equal("authorId", [user.$id]),
            Query.orderDesc("$createdAt"),
            Query.limit(20),
          ]
        );

        setStories(res.documents);
      } catch (err) {
        console.error("Failed to fetch user stories", err);
      } finally {
        setLoadingStories(false);
      }
    };

    fetchUserStories();
  }, [user]);

  /* ---------------- DATE RANGE HELPERS ---------------- */
  const now = new Date();

  const isInRange = (date, range) => {
    const d = new Date(date);

    switch (range) {
      case "today":
        return d.toDateString() === now.toDateString();
      case "24h":
        return now - d <= 24 * 60 * 60 * 1000;
      case "7d":
        return now - d <= 7 * 24 * 60 * 60 * 1000;
      case "month":
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      case "6m":
        return now - d <= 6 * 30 * 24 * 60 * 60 * 1000;
      case "1y":
        return now - d <= 365 * 24 * 60 * 60 * 1000;
      default:
        return true;
    }
  };

  /* ---------------- RANGE META ---------------- */
  const RANGE_OPTIONS = [
    { label: "Today", value: "today" },
    { label: "Last 24 hours", value: "24h" },
    { label: "Last 7 days", value: "7d" },
    { label: "This month", value: "month" },
    { label: "Last 6 months", value: "6m" },
    { label: "Last 1 year", value: "1y" },
  ];

  const RANGE_META = {
    today: { title: "Today", subtitle: "Today (UTC)" },
    "24h": { title: "Last 24 hours", subtitle: "Last 24 hours (UTC)" },
    "7d": { title: "Last 7 days", subtitle: "Last 7 days (UTC)" },
    month: { title: "Monthly", subtitle: "This month (UTC)" },
    "6m": { title: "Last 6 months", subtitle: "Last 6 months (UTC)" },
    "1y": { title: "Last 1 year", subtitle: "Last 12 months (UTC)" },
  };

  /* ---------------- FILTER STORIES ---------------- */
  const filteredStories = stories.filter((story) =>
    isInRange(story.$createdAt, range)
  );

  /* ---------------- BUILD STATS MAP ---------------- */
  const statsMap = {};

  filteredStories.forEach((story) => {
    const d = new Date(story.$createdAt);
    const dateKey = d.toISOString().split("T")[0]; // YYYY-MM-DD

    if (!statsMap[dateKey]) {
      statsMap[dateKey] = { views: 0, reads: 0 };
    }

    statsMap[dateKey].views += story.views || 0;
    statsMap[dateKey].reads += story.reads || 0;
  });

  /* ---------------- TOTAL STATS ---------------- */
  const views = filteredStories.reduce((s, x) => s + (x.views || 0), 0);
  const reads = filteredStories.reduce((s, x) => s + (x.reads || 0), 0);
  const readRatio = views > 0 ? Math.round((reads / views) * 100) : 0;

  /* ---------------- CHART DATA ---------------- */
  const chartData = Object.entries(statsMap)
    .map(([date, data]) => ({
      date,
      label: new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      }),
      views: data.views,
      reads: data.reads,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const { title, subtitle } = RANGE_META[range];

  /* ---------------- RENDER ---------------- */
  return (
    <div className="w-full">
      <div className="max-w-[800px] mx-auto px-4">
        <div className="pt-8 border-b border-gray-300 pb-4">
          <p className="text-[22px] font-semibold">Stats</p>
        </div>

        <div className="flex justify-between mt-10 items-end">
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

        <div className="grid grid-cols-3 gap-4 mt-10">
          <Stat label="Views" value={views} />
          <Stat label="Reads" value={reads} />
          <Stat label="Read ratio" value={`${readRatio}%`} />
        </div>

        {/* <div className="mt-12">
          <p className="text-sm font-semibold mb-3">Views over time</p>
          <div className="border rounded p-4">
            <StatsLineChart range={range} data={chartData} />
          </div>
        </div> */}

        <div className="mt-14">
          <p className="text-sm font-semibold mb-4">Your stories</p>

          {loadingStories && (
            <p className="text-sm text-gray-500">Loading stories...</p>
          )}

          {!loadingStories && stories.length === 0 && (
            <p className="text-sm text-gray-500">No stories published yet.</p>
          )}

          <div className="space-y-4">
            {paginatedStories.map((story) => (
              <div
                key={story.$id}
                className="flex justify-between border-b border-gray-300 pb-3"
              >
                <p className="text-sm max-w-[60%] truncate">
                  {story.title}
                </p>
                <div className="flex gap-6 text-sm text-gray-700">
                  <span>{story.views || 0} views</span>
                  <span>{story.reads || 0} reads</span>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <button
                disabled={pageIndex === 1}
                onClick={() => setPageIndex((p) => p - 1)}
                className="bg-gray-200  rounded-full p-1 cursor-pointer rotate-180 disabled:opacity-40"
              >
                <MdOutlineNavigateNext size={26} />
              </button>

              <p className="text-sm">
                Page {pageIndex} of {totalPages}
              </p>

              <button
                disabled={pageIndex === totalPages}
                onClick={() => setPageIndex((p) => p + 1)}
                className=" bg-gray-200  rounded-full p-1 cursor-pointer disabled:opacity-40"
              >
                <MdOutlineNavigateNext size={26} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div className="p-4 border border-gray-300 rounded">
    <p className="text-sm text-gray-700">{label}</p>
    <p className="text-[22px] font-semibold mt-2">
      {value.toLocaleString?.() ?? value}
    </p>
  </div>
);

export default Page;
