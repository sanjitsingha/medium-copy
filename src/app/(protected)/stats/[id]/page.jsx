"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuthContext } from "@/context/AuthContext";
import Image from "next/image";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Chart from "chart.js/auto";

export default function AnalyticsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthContext();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [referrerData, setReferrerData] = useState([]);
  const [utmData, setUtmData] = useState([]);
  const [deviceData, setDeviceData] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const downloadCSV = () => {
    if (!chartData || chartData.length === 0) return;
    const rows = [["date", "views"], ...chartData.map((r) => [r.date, r.views])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${article?.slug || id}-views.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (!user || !id) return;

    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const { data: articleData, error: articleError } = await supabase
          .from("articles")
          .select("*")
          .eq("id", id)
          .single();

        if (articleError) throw articleError;
        if (articleData?.author_id !== user?.id) {
          setArticle(null);
          setLoading(false);
          return;
        }

        const [
          { data: viewsData },
          { data: likesData },
          { data: bookmarksData },
        ] = await Promise.all([
          supabase.from("views").select("*").eq("article_id", id),
          supabase.from("likes").select("*").eq("article_id", id),
          supabase.from("bookmarks").select("*").eq("article_id", id),
        ]);

        const views = viewsData || [];
        const likes = likesData || [];
        const bookmarks = bookmarksData || [];

        setArticle({
          ...articleData,
          views,
          likes,
          bookmarks,
        });

        // Process views for the chart
        if (views.length > 0) {
          const sortedViews = [...views].sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at),
          );
          const orderedViewsByDate = sortedViews.reduce((acc, view) => {
            const dateStr = new Date(view.created_at).toLocaleDateString(
              "en-US",
              { month: "short", day: "numeric" },
            );
            acc[dateStr] = (acc[dateStr] || 0) + 1;
            return acc;
          }, {});

          setChartData(
            Object.keys(orderedViewsByDate).map((date) => ({
              date,
              views: orderedViewsByDate[date],
            })),
          );

          // Process referrer data
          const referrerCounts = sortedViews.reduce((acc, view) => {
            const source = view.referrer || "Direct / Unknown";
            acc[source] = (acc[source] || 0) + 1;
            return acc;
          }, {});

          const sortedReferrers = Object.entries(referrerCounts)
            .map(([source, count]) => ({ source, count }))
            .sort((a, b) => b.count - a.count);

          setReferrerData(sortedReferrers);

          const utmCounts = sortedViews.reduce((acc, view) => {
            const source = view.utm_source || "Direct / Unknown";
            acc[source] = (acc[source] || 0) + 1;
            return acc;
          }, {});
          setUtmData(
            Object.entries(utmCounts)
              .map(([source, count]) => ({ source, count }))
              .sort((a, b) => b.count - a.count),
          );

          const deviceCounts = sortedViews.reduce((acc, view) => {
            const device = view.device_type || "Unknown";
            acc[device] = (acc[device] || 0) + 1;
            return acc;
          }, {});
          setDeviceData(
            Object.entries(deviceCounts)
              .map(([device, count]) => ({ device, count }))
              .sort((a, b) => b.count - a.count),
          );

          const locationCounts = sortedViews.reduce((acc, view) => {
            const location = view.location || "Unknown";
            acc[location] = (acc[location] || 0) + 1;
            return acc;
          }, {});
          setLocationData(
            Object.entries(locationCounts)
              .map(([location, count]) => ({ location, count }))
              .sort((a, b) => b.count - a.count),
          );
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [id, user]);

  useEffect(() => {
    if (!chartRef.current) return;
    const labels = chartData.map((d) => d.date);
    const data = {
      labels,
      datasets: [
        {
          label: "Views",
          data: chartData.map((d) => d.views || 0),
          backgroundColor: labels.map((_, i) => [
            "#06B6D4",
            "#4F46E5",
            "#F59E0B",
            "#EF4444",
            "#10B981",
            "#8B5CF6",
            "#F97316",
          ][i % 7]),
          borderColor: labels.map((_, i) => "rgba(0,0,0,0.06)"),
          borderWidth: 1,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { mode: "index", intersect: false } },
      interaction: { mode: "index", intersect: false },
      scales: {
        x: { ticks: { color: "#6B7280" }, grid: { display: false } },
        y: { ticks: { color: "#6B7280" }, beginAtZero: true, grid: { color: "#F3F4F6" } },
      },
      animation: { duration: 600, easing: "easeOutQuart" },
    };

    if (chartInstanceRef.current) chartInstanceRef.current.destroy();
    const ctx = chartRef.current.getContext("2d");
    chartInstanceRef.current = new Chart(ctx, { type: "bar", data, options });

    return () => {
      if (chartInstanceRef.current) chartInstanceRef.current.destroy();
    };
  }, [chartData]);

  if (loading) {
    return (
      <div className="w-full bg-white min-h-screen pt-24 text-center">
        <p className="text-gray-500 font-creato">Loading analytics...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="w-full bg-white min-h-screen pt-24 text-center">
        <p className="text-black text-xl font-bold font-creato">
          Article not found
        </p>
        <button
          onClick={() => router.back()}
          className="text-gray-500 mt-4 underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  const totalViews = article.views?.length || 0;
  const totalLikes = article.likes?.length || 0;
  const totalBookmarks = article.bookmarks?.length || 0;

  return (
    <div className="w-full bg-white min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 md:px-6 pt-16 font-creato">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-black mb-8 transition-colors cursor-pointer"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span className="text-[14px]">Back to Stats</span>
        </button>

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6 border-b border-gray-100 pb-8">
          <div className="flex items-center gap-6">
            {/* <div className="w-24 h-24 shrink-0 overflow-hidden rounded-xl bg-gray-100 relative">
              <Image src={article.cover_image || '/placeholder.png'} fill={true} alt={article.title} className="object-cover" />
            </div> */}
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-black line-clamp-2 leading-tight">
                {article.title}
              </h1>
              <p className="text-[13px] text-gray-500 mt-">
                Published on{" "}
                {new Date(article.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          {/* <div className="shrink-0 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
            <p className="text-[12px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Status</p>
            <p className="text-[15px] text-black capitalize font-medium">{article.status}</p>
          </div> */}
        </div>

        {/* High Level Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white  ">
            <div className="flex items-center gap-3 mb-4">
              {/* <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div> */}
              <p className="text-[14px] text-gray-500 font-medium">
                Total Views
              </p>
            </div>
            <p className="text-4xl font-bold text-black">{totalViews}</p>
          </div>

          <div className="bg-white  ">
            <div className="flex items-center gap-3 mb-4">
              {/* <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div> */}
              <p className="text-[14px] text-gray-500 font-medium">
                Total Likes
              </p>
            </div>
            <p className="text-4xl font-bold text-black">{totalLikes}</p>
          </div>

          <div className="bg-white  ">
            <div className="flex items-center gap-3 mb-4">
              {/* <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              </div> */}
              <p className="text-[14px] text-gray-500 font-medium">Bookmarks</p>
            </div>
            <p className="text-4xl font-bold text-black">{totalBookmarks}</p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="w-full bg-white  mt-20">
          <h2 className="text-xl font-semibold text-black mb-8">
            Views Over Time
          </h2>

          <div className="w-full h-[350px]">
            <div className="flex items-center justify-between mb-4">
            
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadCSV}
                  className="px-3 py-1.5 rounded-full text-sm border bg-white text-gray-700 border-gray-200"
                >
                  Download CSV
                </button>
              </div>
            </div>

            {chartData.length > 0 ? (
              <div className="w-full h-[290px]">
                <canvas ref={chartRef} className="w-full h-full" />
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <p>No views recorded yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Traffic Sources Section */}
        <div className="w-full bg-white mt-16">
          <h2 className="text-xl font-semibold text-black mb-8">
            Traffic Sources
          </h2>

          {referrerData.length > 0 ? (
            <div className="space-y-4">
              {referrerData.map((item, index) => {
                const maxCount = referrerData[0].count;
                const percentage =
                  totalViews > 0
                    ? ((item.count / totalViews) * 100).toFixed(1)
                    : 0;
                const barWidth =
                  maxCount > 0 ? (item.count / maxCount) * 100 : 0;

                return (
                  <div key={index} className="group">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        {item.source !== "Direct / Unknown" && (
                          <Image
                            src={`https://www.google.com/s2/favicons?domain=${item.source}&sz=32`}
                            alt=""
                            width={16}
                            height={16}
                            className="w-4 h-4 rounded-sm"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        )}
                        <p className="text-[14px] text-black font-medium">
                          {item.source}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[13px] text-gray-400 font-medium">
                          {percentage}%
                        </span>
                        <span className="text-[14px] text-black font-semibold w-8 text-right">
                          {item.count}
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-black rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="w-full py-12 flex flex-col items-center justify-center text-gray-400">
              <p>No referral data recorded yet.</p>
              <p className="text-[13px] mt-1">
                Traffic sources will appear as people visit your article.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 mt-16 md:grid-cols-2">
          <div className="w-full bg-white rounded-3xl p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-black mb-6">
              UTM Sources
            </h2>
            {utmData.length > 0 ? (
              <div className="space-y-4">
                {utmData.map((item, index) => {
                  const percentage =
                    totalViews > 0
                      ? ((item.count / totalViews) * 100).toFixed(1)
                      : 0;
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-4"
                    >
                      <div>
                        <p className="text-[14px] text-black font-medium">
                          {item.source}
                        </p>
                        <p className="text-[13px] text-gray-500">
                          {item.count} visits
                        </p>
                      </div>
                      <span className="text-[13px] text-gray-400">
                        {percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-400">
                <p>No UTM source data available yet.</p>
                <p className="text-[13px] mt-1">
                  Add UTM tags to links to track campaign performance.
                </p>
              </div>
            )}
          </div>

          <div className="w-full bg-white rounded-3xl p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-black mb-6">
              Device Breakdown
            </h2>
            {deviceData.length > 0 ? (
              <div className="space-y-4">
                {deviceData.map((item, index) => {
                  const percentage =
                    totalViews > 0
                      ? ((item.count / totalViews) * 100).toFixed(1)
                      : 0;
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-4"
                    >
                      <div>
                        <p className="text-[14px] text-black font-medium">
                          {item.device}
                        </p>
                        <p className="text-[13px] text-gray-500">
                          {item.count} views
                        </p>
                      </div>
                      <span className="text-[13px] text-gray-400">
                        {percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-400">
                <p>No device data recorded yet.</p>
                <p className="text-[13px] mt-1">
                  Device types will show once readers arrive.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="w-full bg-white rounded-3xl p-6 border border-gray-100 mt-6">
          <h2 className="text-xl font-semibold text-black mb-6">
            Top Locations
          </h2>
          {locationData.length > 0 ? (
            <div className="space-y-4">
              {locationData.map((item, index) => {
                const percentage =
                  totalViews > 0
                    ? ((item.count / totalViews) * 100).toFixed(1)
                    : 0;
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-[14px] text-black font-medium">
                        {item.location}
                      </p>
                      <p className="text-[13px] text-gray-500">
                        {item.count} views
                      </p>
                    </div>
                    <span className="text-[13px] text-gray-400">
                      {percentage}%
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400">
              <p>No location data recorded yet.</p>
              <p className="text-[13px] mt-1">
                Location will appear when readers load the page.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
