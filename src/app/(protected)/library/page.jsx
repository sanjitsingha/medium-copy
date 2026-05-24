"use client";
import React, { useEffect, useState } from "react";
import { IoBookmark } from "react-icons/io5";
import {
  ArrowUpRightIcon,
  EllipsisHorizontalIcon,
  BookmarkSlashIcon,
  TrashIcon,
  ArrowTrendingUpIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useAuthContext } from "@/context/AuthContext";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { PiShareFatThin } from "react-icons/pi";

const Page = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabFromUrl = searchParams.get("tab");
  const [selectedTab, setSelectedTab] = useState("your-list");
  const activeTab = tabFromUrl || selectedTab;

  const { user } = useAuthContext();
  const [bookmarks, setBookmarks] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const { data } = supabase.storage.from("article-images").getPublicUrl(path);
    return data.publicUrl;
  };

  // 🔹 Fetch Data
  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchBookmarks = async () => {
      setLoading(true);

      // Fetch Bookmarks
      const { data, error } = await supabase
        .from("bookmarks")
        .select(
          `
          id,
          articles (
            id,
            title,
            slug,
            created_at,
            users!fk_author (
              id,
              name,
              avatar
            )
          )
        `,
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setBookmarks(data);
      }
      setLoading(false);
    };
    fetchBookmarks();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleRemoveBookmark = async (e, bookmarkId) => {
    e.stopPropagation();
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", bookmarkId);

    if (!error) {
      setBookmarks((prev) => prev.filter((item) => item.id !== bookmarkId));
      setActiveMenu(null);
    }
  };

  const handleShare = async (e, article) => {
    e.stopPropagation();
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
    setActiveMenu(null);
  };

  return (
    <div className="w-full bg-white min-h-screen pb-20">
      <div className="max-w-3xl mx-auto px-4 md:px-6 pt-16 font-creato">
        {/* Header Section */}
        <div className="w-full flex justify-between items-end mb-12">
          <h1 className="text-4xl font-semibold tracking-tight text-black">
            Library
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 mb-8 border-b border-gray-100">
          <button
            onClick={() => {
              setSelectedTab("your-list");
              router.push("/library?tab=your-list");
            }}
            className={`pb-4 text-[15px] font-medium transition-colors cursor-pointer relative ${
              activeTab === "your-list"
                ? "text-black"
                : "text-gray-500 hover:text-black"
            }`}
          >
            Your List{" "}
            {bookmarks.length > 0 && (
              <span className="ml-1 text-gray-400 font-normal">
                {bookmarks.length}
              </span>
            )}
            {activeTab === "your-list" && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-black"></span>
            )}
          </button>

          <button
            onClick={() => {
              setSelectedTab("watch-history");
              router.push("/library?tab=watch-history");
            }}
            className={`pb-4 text-[15px] font-medium transition-colors cursor-pointer relative ${
              activeTab === "watch-history"
                ? "text-black"
                : "text-gray-500 hover:text-black"
            }`}
          >
            Watch History{" "}
            {history.length > 0 && (
              <span className="ml-1 text-gray-400 font-normal">
                {history.length}
              </span>
            )}
            {activeTab === "watch-history" && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-black"></span>
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="w-full">
          {loading ? (
            <div className="py-10 text-center">
              <p className="text-gray-500 text-[15px]">
                Loading your library...
              </p>
            </div>
          ) : activeTab === "your-list" ? (
            bookmarks.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-black font-medium text-lg mb-2">
                  Your list is empty.
                </p>
                <p className="text-gray-500 text-[15px]">
                  Save stories to read them later.
                </p>
              </div>
            ) : (
              <div className="flex flex-col">
                {bookmarks.map((item) => (
                  <div
                    key={item.id}
                    className="py-6 flex items-start border-b border-gray-100 gap-6 group"
                  >
                    <div className="flex-1">
                      <Link
                        href={`/read/${item.articles?.slug || item.articles?.id}`}
                      >
                        <h2 className="text-[20px] font-bold text-black mb-2 line-clamp-2 group-hover:underline decoration-gray-300 underline-offset-4 leading-snug">
                          {item.articles?.title}
                        </h2>
                        {item.articles?.subtitle && (
                          <p className="text-[15px] text-gray-500 line-clamp-2 mb-3">
                            {item.articles?.subtitle}
                          </p>
                        )}
                      </Link>
                      <div className="flex items-center text-[13px] text-gray-500 mt-2 gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center border border-gray-100">
                            {item.articles?.users?.avatar ? (
                              <Image
                                src={getImageUrl(item.articles.users.avatar)}
                                alt={item.articles.users.name}
                                width={20}
                                height={20}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="text-[10px] text-gray-400 font-medium">
                                {item.articles?.users?.name?.[0]?.toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-gray-700">
                            {item.articles?.users?.name}
                          </span>
                        </div>
                        <span>•</span>
                        <span>
                          {new Date(
                            item.articles?.created_at,
                          ).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span>•</span>
                        <span>
                          {Math.max(
                            1,
                            Math.ceil(
                              (item.articles?.content?.length || 1000) / 1000,
                            ),
                          )}{" "}
                          min read
                        </span>
                      </div>
                    </div>

                    <div className="hidden sm:block shrink-0">
                      <Image
                        src={
                          getImageUrl(item.articles.cover_image) ||
                          "/vichento-image-placeholder.png"
                        }
                        width={600}
                        height={400}
                        alt={item.articles.title}
                        className="object-cover rounded h-[120px] w-[200px] border border-gray-100"
                      />
                    </div>

                    <div className="relative shrink-0 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(
                            activeMenu === item.id ? null : item.id,
                          );
                        }}
                        className="p-1 cursor-pointer rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <EllipsisHorizontalIcon className="w-6 h-6 text-gray-500" />
                      </button>

                      {activeMenu === item.id && (
                        <div className="absolute right-0 top-8 w-48 bg-white border border-gray-100 shadow-lg rounded-xl overflow-hidden z-50 py-1">
                          <button
                            onClick={(e) => handleShare(e, item.articles)}
                            className="flex px-4 py-2.5 text-[14px] text-gray-700 hover:bg-gray-50 transition-colors items-center gap-3 w-full text-left"
                          >
                            <PiShareFatThin className="w-4 h-4 text-gray-400" />
                            <span>Share</span>
                          </button>

                          <button
                            onClick={(e) => handleRemoveBookmark(e, item.id)}
                            className="flex px-4 py-2.5 text-[14px] text-red-600 hover:bg-red-50 transition-colors items-center gap-3 w-full text-left"
                          >
                            <TrashIcon className="w-4 h-4 text-red-500" />
                            <span>Remove from list</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : activeTab === "watch-history" ? (
            history.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-black font-medium text-lg mb-2">
                  No history found.
                </p>
                <p className="text-gray-500 text-[15px]">
                  Stories you read will appear here.
                </p>
              </div>
            ) : (
              <div className="flex flex-col">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="py-6 flex items-start border-b border-gray-100 gap-6 group"
                  >
                    <div className="flex-1">
                      <Link
                        href={`/read/${item.articles?.slug || item.articles?.id}`}
                      >
                        <h2 className="text-[20px] font-bold text-black mb-2 line-clamp-2 group-hover:underline decoration-gray-300 underline-offset-4 leading-snug">
                          {item.articles?.title}
                        </h2>
                        {item.articles?.subtitle && (
                          <p className="text-[15px] text-gray-500 line-clamp-2 mb-3">
                            {item.articles?.subtitle}
                          </p>
                        )}
                      </Link>
                      <div className="flex items-center text-[13px] text-gray-500 mt-2 gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center border border-gray-100">
                            {item.articles?.users?.avatar ? (
                              <Image
                                src={getImageUrl(item.articles.users.avatar)}
                                alt={item.articles.users.name}
                                width={20}
                                height={20}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="text-[10px] text-gray-400 font-medium">
                                {item.articles?.users?.name?.[0]?.toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-gray-700">
                            {item.articles?.users?.name}
                          </span>
                        </div>
                        <span>•</span>
                        <span>
                          Read on{" "}
                          {new Date(item.created_at).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </span>
                        <span>•</span>
                        <span>
                          {Math.max(
                            1,
                            Math.ceil(
                              (item.articles?.content?.length || 1000) / 1000,
                            ),
                          )}{" "}
                          min read
                        </span>
                      </div>
                    </div>

                    <div className="hidden sm:block shrink-0">
                      <Image
                        src={
                          getImageUrl(item.articles.cover_image) ||
                          "/vichento-image-placeholder.png"
                        }
                        width={600}
                        height={400}
                        alt={item.articles.title}
                        className="object-cover rounded w-28 h-28 border border-gray-100"
                      />
                    </div>

                    <div className="relative shrink-0 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(
                            activeMenu === item.id ? null : item.id,
                          );
                        }}
                        className="p-1 cursor-pointer rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <EllipsisHorizontalIcon className="w-6 h-6 text-gray-500" />
                      </button>

                      {activeMenu === item.id && (
                        <div className="absolute right-0 top-8 w-48 bg-white border border-gray-100 shadow-lg rounded-xl overflow-hidden z-50 py-1">
                          <button
                            onClick={(e) => handleShare(e, item.articles)}
                            className="flex px-4 py-2.5 text-[14px] text-gray-700 hover:bg-gray-50 transition-colors items-center gap-3 w-full text-left"
                          >
                            <PiShareFatThin className="w-4 h-4 text-gray-400" />
                            <span>Share</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Page;
