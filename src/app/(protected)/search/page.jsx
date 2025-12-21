"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Query } from "appwrite";
import Link from "next/link";
import Image from "next/image";
import { databases, storage } from "@/lib/appwrite";
import { IoBookmarkOutline, IoBulbOutline } from "react-icons/io5";
import { IoIosShareAlt } from "react-icons/io";
import StoriesCardHorizontal from "@/app/components/StoriesCardHorizontal";
import useArticleActions from "@/hooks/useArticleActions";
import { useAuthContext } from "@/context/AuthContext";
const page = () => {
  const { user } = useAuthContext();
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const [activeTab, setActiveTab] = useState("stories");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const { likes, bookmarks, toggleLike, toggleBookmark } = useArticleActions(
    user?.$id
  );

  useEffect(() => {
    if (!query) return;

    const fetchSearchResults = async () => {
      setLoading(true);

      try {
        const response = await databases.listDocuments(
          "693d3d220017a846a1c0", // DATABASE ID
          "articles", // COLLECTION ID
          [
            Query.equal("status", ["published"]),
            Query.orderDesc("$updatedAt"),
            Query.limit(50), // fetch more, then filter
          ]
        );

        // CLIENT SIDE FILTER
        const filtered = response.documents.filter((article) => {
          const title = article.title?.toLowerCase() || "";
          return title.includes(query);
        });

        setArticles(filtered);
      } catch (error) {
        console.error("Search fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  return (
    <div className="w-full">
      <div className="max-w-[800px] mx-auto">
        <div className="w-full mt-6">
          <p className="text-[32px] tracking-tight font-semibold">
            Search results for{" "}
            <span className=" text-gray-600">{query ? `"${query}"` : ""}</span>
          </p>
        </div>
        <div className="mt-4 border-b border-gray-200 mb-10 flex gap-10">
          <button
            onClick={() => setActiveTab("stories")}
            className={`pb-2 text-[14px] ${
              activeTab === "stories"
                ? "text-black border-b-2 border-black"
                : "text-gray-500"
            }`}
          >
            Stories
          </button>
        </div>

        {/* Results */}
        {loading && <p className="text-sm text-gray-500">Searching stories…</p>}

        {!loading && articles.length === 0 && (
          <p className="text-sm text-gray-500">
            No stories found for "{query}"
          </p>
        )}

        {!loading &&
          articles.map((article) => (
            <StoriesCardHorizontal
              key={article.$id}
              article={article}
              isLiked={likes.has(article.$id)}
              isBookmarked={bookmarks.has(article.$id)}
              onLike={toggleLike}
              onBookmark={toggleBookmark}
            />
          ))}
      </div>
    </div>
  );
};

export default page;
