"use client";
import { ArrowTrendingUpIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { RxShare2 } from "react-icons/rx";
import { BsThreeDots } from "react-icons/bs";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { useAuthContext } from "@/context/AuthContext";
import Chart from "chart.js/auto";

// ─── Constants ────────────────────────────────────────────────────────────────

const TIME_RANGES = [
  { key: "today", label: "Today" },
  { key: "48h", label: "48 Hours" },
  { key: "7d", label: "7 Days" },
  { key: "month", label: "This Month" },
  { key: "custom", label: "Custom" },
];

/** Returns an ISO string for the start of the given range. End is always now. */
function getRangeStart(key, customFrom) {
  const now = new Date();
  switch (key) {
    case "today": {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      return d.toISOString();
    }
    case "48h":
      return new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    case "month": {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      return d.toISOString();
    }
    case "custom":
      return customFrom
        ? new Date(customFrom).toISOString()
        : new Date(0).toISOString();
    default:
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StatsPage() {
  const { user } = useAuthContext();

  const [publishedArticles, setPublishedArticles] = useState([]);
  const [draftArticles, setDraftArticles] = useState([]);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalBookmarks: 0,
  });
  const [topStory, setTopStory] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [activeRange, setActiveRange] = useState("7d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [chartData, setChartData] = useState([]);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchAllArticles = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const rangeStart = getRangeStart(activeRange, customFrom);
    const rangeEnd =
      activeRange === "custom" && customTo
        ? new Date(customTo + "T23:59:59").toISOString()
        : new Date().toISOString();

    // Fetch all articles for this author
    const { data: articlesData, error: articlesError } = await supabase
      .from("articles")
      .select("*")
      .eq("author_id", user.id)
      .order("created_at", { ascending: false });

    if (articlesError) {
      console.log("Error fetching articles:", articlesError);
      setLoading(false);
      return;
    }

    const published = articlesData.filter((a) => a.status === "published");
    const drafts = articlesData.filter((a) => a.status === "draft");

    // For each published article, fetch view/like counts within the time range
    const enriched = await Promise.all(
      published.map(async (article) => {
        const [{ count: vCount }, { count: lCount }] = await Promise.all([
          supabase
            .from("views")
            .select("*", { count: "exact", head: true })
            .eq("article_id", article.id)
            .gte("created_at", rangeStart)
            .lte("created_at", rangeEnd),
          supabase
            .from("likes")
            .select("*", { count: "exact", head: true })
            .eq("article_id", article.id),
        ]);
        return { ...article, vCount: vCount ?? 0, lCount: lCount ?? 0 };
      }),
    );

    const totalViews = enriched.reduce((s, a) => s + a.vCount, 0);
    const totalLikes = enriched.reduce((s, a) => s + a.lCount, 0);
    const publishedIds = published.map((a) => a.id);

    let totalBookmarks = 0;
    if (publishedIds.length > 0) {
      const { count: bCount } = await supabase
        .from("bookmarks")
        .select("*", { count: "exact", head: true })
        .in("article_id", publishedIds);
      totalBookmarks = bCount ?? 0;
    }

    // ── Generate Chart Data ──
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const now = new Date();

    if (activeRange === "7d" && publishedIds.length > 0) {
      const last7 = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const dayStart = d.toISOString();
        const dayEnd = new Date(
          d.getTime() + 24 * 60 * 60 * 1000 - 1,
        ).toISOString();
        last7.push({
          name: days[d.getDay()],
          views: 0,
          start: dayStart,
          end: dayEnd,
        });
      }

      // Fetch daily counts in parallel
      await Promise.all(
        last7.map(async (slot) => {
          const { count } = await supabase
            .from("views")
            .select("*", { count: "exact", head: true })
            .in("article_id", publishedIds)
            .gte("created_at", slot.start)
            .lte("created_at", slot.end);
          slot.views = count || 0;
        }),
      );

      setChartData(last7);
    } else {
      // For other ranges, just show total views on the last day as a fallback
      const fallback = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        fallback.push({ name: days[d.getDay()], views: 0 });
      }
      if (fallback.length > 0) {
        fallback[fallback.length - 1].views = totalViews;
      }
      setChartData(fallback);
    }

    setPublishedArticles(enriched);
    setDraftArticles(drafts);
    setTopStory(
      enriched.reduce(
        (best, item) => (item.vCount > (best?.vCount || 0) ? item : best),
        null,
      ),
    );
    setStats({ totalViews, totalLikes, totalBookmarks });
    setLoading(false);
  }, [user, activeRange, customFrom, customTo]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchAllArticles();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchAllArticles]);

  // Chart.js refs and rendering
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const labels = chartData.map((d) => d.name);
    const data = {
      labels,
      datasets: [
        {
          label: "Views",
          data: chartData.map((d) => d.views || 0),
          backgroundColor: labels.map((_, i) => {
            const palette = [
              "#4F46E5",
              "#06B6D4",
              "#F59E0B",
              "#EF4444",
              "#10B981",
              "#8B5CF6",
              "#F97316",
            ];
            return palette[i % palette.length];
          }),
          borderColor: "rgba(0,0,0,0.05)",
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { mode: "index", intersect: false },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: "#6B7280" } },
        y: { beginAtZero: true, ticks: { color: "#6B7280" } },
      },
    };

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    chartInstanceRef.current = new Chart(ctx, {
      type: "bar",
      data,
      options,
    });

    return () => {
      if (chartInstanceRef.current) chartInstanceRef.current.destroy();
    };
  }, [chartData]);

  

  

  // ── Helpers ────────────────────────────────────────────────────────────────

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const { data } = supabase.storage.from("article-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleRangeClick = (key) => {
    setActiveRange(key);
    setShowCustomPicker(key === "custom");
  };

  const handleShare = async (article) => {
    const url = `${window.location.origin}/read/${article.slug || article.id}`;
    if (navigator.share) {
      await navigator.share({
        title: article.title,
        text: article.subtitle || article.title,
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard");
    }
  };

  const latestPublished = publishedArticles[0];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="w-full bg-white min-h-screen pb-20">
      <div className="max-w-3xl mx-auto px-4 md:px-6 pt-16 font-creato">
        {/* Header */}
        <h1 className="text-4xl font-semibold tracking-tight text-black mb-8">
          Stats
        </h1>

        {/* ── Time Range Filter ── */}
        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-2">
            {TIME_RANGES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleRangeClick(key)}
                className={[
                  "text-[13px] px-4 py-1.5 rounded-full border transition-all duration-150 cursor-pointer",
                  activeRange === key
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-black",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Custom date inputs */}
          {showCustomPicker && (
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <div className="flex items-center gap-2">
                <label className="text-[13px] text-gray-500 whitespace-nowrap">
                  From
                </label>
                <input
                  type="date"
                  value={customFrom}
                  max={customTo || new Date().toISOString().split("T")[0]}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="text-[13px] border border-gray-200 rounded-lg px-3 py-1.5 text-black focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[13px] text-gray-500 whitespace-nowrap">
                  To
                </label>
                <input
                  type="date"
                  value={customTo}
                  min={customFrom}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="text-[13px] border border-gray-200 rounded-lg px-3 py-1.5 text-black focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <button
                onClick={fetchAllArticles}
                disabled={!customFrom || !customTo}
                className="text-[13px] px-4 py-1.5 bg-black text-white rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Apply
              </button>
            </div>

            
          )}
        </div>

        {loading ? (
          <p className="text-gray-500">Loading stats...</p>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="py-6 px-5">
                <p className="text-[13px] text-gray-500 mb-1 tracking-wide uppercase">
                  Published
                </p>
                <p className="text-4xl font-bold text-black tracking-tight">
                  {publishedArticles.length}
                </p>
              </div>
              <div className="py-6 px-5">
                <p className="text-[13px] text-gray-500 mb-1 tracking-wide uppercase">
                  Views
                </p>
                <p className="text-4xl font-bold text-black tracking-tight">
                  {stats.totalViews}
                </p>
              </div>
              <div className="py-6 px-5">
                <p className="text-[13px] text-gray-500 mb-1 tracking-wide uppercase">
                  Likes
                </p>
                <p className="text-4xl font-bold text-black tracking-tight">
                  {stats.totalLikes}
                </p>
              </div>
              <div className="py-6 px-5">
                <p className="text-[13px] text-gray-500 mb-1 tracking-wide uppercase">
                  Bookmarks
                </p>
                <p className="text-4xl font-bold text-black tracking-tight">
                  {stats.totalBookmarks}
                </p>
              </div>
            </div>
            {topStory && (
              <div className="rounded-3xl border border-gray-100 bg-white p-6 mb-10">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-[13px] text-gray-500 uppercase tracking-wide mb-1">
                      Top Performing Story
                    </p>
                    <h2 className="text-xl font-semibold text-black leading-tight line-clamp-2">
                      {topStory.title}
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] text-gray-500">
                      {topStory.vCount} views in the selected range
                    </p>
                    <p className="text-[14px] text-black font-semibold mt-2">
                      {topStory.lCount || 0} likes
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Chart Section */}
            <div className="w-full mb-14 p-6">
              <h2 className="text-[15px] font-semibold text-black mb-6">
                Views Over Time
              </h2>
              <div className="h-[250px] w-full">
                <div className="h-full w-full">
                  <canvas ref={chartRef} />
                </div>
              </div>
            </div>

            {/* Two Column: Latest Published + Drafts */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
              {/* Latest Published Card */}
              <div className="w-full border border-gray-200 rounded-xl p-6">
                <h2 className="text-[15px] font-semibold text-black mb-6">
                  Latest Published
                </h2>
                {latestPublished ? (
                  <>
                    <div className="flex gap-4 pb-5 border-b border-gray-100">
                      <div className="overflow-hidden relative w-[110px] h-[80px] shrink-0 rounded bg-gray-100">
                        <Image
                          src={
                            getImageUrl(latestPublished.cover_image) ||
                            "/vichento-image-placeholder.png"
                          }
                          fill={true}
                          alt="cover"
                          style={{ objectFit: "cover" }}
                          className="rounded"
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <Link
                          href={`/read/${latestPublished.slug || latestPublished.id}`}
                          className="hover:underline"
                        >
                          <p className="text-[15px] line-clamp-2 text-black font-medium leading-snug">
                            {latestPublished.title}
                          </p>
                        </Link>
                        <p className="text-[13px] text-gray-400 mt-1">
                          {new Date(
                            latestPublished.created_at,
                          ).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="pt-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-[14px] text-gray-500">Views</p>
                        <p className="text-[18px] font-bold text-black">
                          {latestPublished.vCount}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[14px] text-gray-500">Likes</p>
                        <p className="text-[18px] font-bold text-black">
                          {latestPublished.lCount}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 pt-3">
                        <button
                          onClick={() => handleShare(latestPublished)}
                          className="flex items-center gap-2 text-[14px] text-gray-600 border border-gray-200 px-5 py-2 rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          Share <RxShare2 className="text-gray-500" size={16} />
                        </button>
                        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer ml-auto">
                          <BsThreeDots size={18} className="text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-[14px] text-gray-500 text-center py-4">
                    No stories published yet.
                  </p>
                )}
              </div>

              {/* Drafts Card */}
              <div className="w-full border border-gray-200 rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-[15px] font-semibold text-black">
                    Drafts
                  </h2>
                  <Link
                    href="/stories?tab=drafts"
                    className="text-[13px] text-gray-400 hover:text-black transition-colors"
                  >
                    View all
                  </Link>
                </div>
                <div className="space-y-0">
                  {draftArticles.length > 0 ? (
                    draftArticles.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="w-14 h-14 shrink-0 overflow-hidden rounded bg-gray-100 relative">
                          <Image
                            src={
                              getImageUrl(item.cover_image) ||
                              "/vichento-image-placeholder.png"
                            }
                            fill={true}
                            alt="cover"
                            className="rounded object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/write?id=${item.id}`}
                            className="hover:underline"
                          >
                            <p className="text-[14px] text-black font-medium line-clamp-1">
                              {item.title || "Untitled Draft"}
                            </p>
                          </Link>
                          <p className="text-[13px] text-gray-400 mt-0.5">
                            {new Date(item.created_at).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                        <span className="text-[12px] text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full shrink-0">
                          Draft
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[14px] text-gray-500 text-center py-4">
                      No drafts available.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* All Articles Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[15px] font-semibold text-black">
                  All Articles
                </h2>
                <Link
                  href="/stories?tab=published"
                  className="text-[13px] text-gray-400 hover:text-black transition-colors flex items-center gap-1.5"
                >
                  View all <ArrowUpRightIcon className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="flex flex-col">
                {publishedArticles.length > 0 ? (
                  publishedArticles.map((item) => (
                    <div
                      key={item.id}
                      className="py-5 flex items-start gap-5 border-b border-gray-100 group"
                    >
                      <div className="overflow-hidden relative w-[120px] h-[84px] shrink-0 rounded bg-gray-100">
                        <Image
                          src={
                            getImageUrl(item.cover_image) ||
                            "/vichento-image-placeholder.png"
                          }
                          fill={true}
                          alt="cover"
                          style={{ objectFit: "cover" }}
                          className="rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <Link href={`/read/${item.slug || item.id}`}>
                          <p className="text-[16px] font-bold text-black line-clamp-1 leading-snug group-hover:underline decoration-gray-300 underline-offset-4">
                            {item.title}
                          </p>
                        </Link>
                        <p className="text-[13px] text-gray-400 mt-1">
                          {new Date(item.created_at).toLocaleDateString(
                            "en-IN",
                            { day: "numeric", month: "short", year: "numeric" },
                          )}
                          {" • "}
                          {item.vCount} Views
                          {" • "}
                          {item.lCount} Likes
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 self-center">
                        <Link
                          className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-black"
                          href={`/stats/${item.id}`}
                          title="View Analytics"
                        >
                          <ArrowUpRightIcon className="w-[18px] h-[18px]" />
                        </Link>
                        <button
                          className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-black cursor-pointer"
                          title="More options"
                        >
                          <HiOutlineDotsHorizontal className="w-[18px] h-[18px]" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[14px] text-gray-500 text-center py-4">
                    You have not published any articles yet.
                  </p>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
