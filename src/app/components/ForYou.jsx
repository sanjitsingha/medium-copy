"use client";

import { useEffect, useState } from "react";
import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import StoriesCardHorizontal from "./StoriesCardHorizontal";
import ShimmerArticle from "./ShimmerArticle";

const DB_ID = "693d3d220017a846a1c0";
const ARTICLES_COLLECTION = "articles";

export default function ForYou({
  user,
  likes,
  bookmarks,
  onLike,
  onBookmark,
}) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

// console.log(user)

  useEffect(() => {
    if (!user) return;

    const fetchForYou = async () => {
      try {
        /* ✅ READ FROM AUTH USER */
        const interests = user?.prefs?.interests || [];

        let res;

        if (interests.length > 0) {
          res = await databases.listDocuments(
            DB_ID,
            ARTICLES_COLLECTION,
            [
              Query.equal("status", ["published"]),
              Query.contains("categories", interests),
              Query.orderDesc("$updatedAt"),
              Query.limit(10),
            ]
          );
        } else {
          /* Fallback: latest articles */
          res = await databases.listDocuments(
            DB_ID,
            ARTICLES_COLLECTION,
            [
              Query.equal("status", ["published"]),
              Query.orderDesc("$updatedAt"),
              Query.limit(10),
            ]
          );
        }

        setArticles(res.documents);
      } catch (err) {
        console.error("For You feed error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchForYou();
  }, [user]);

  /* ---------------- UI ---------------- */
  if (loading) {
    return (
      <>
        {Array.from({ length: 4 }).map((_, i) => (
          <ShimmerArticle key={i} />
        ))}
      </>
    );
  }

  if (articles.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No stories match your interests yet.
      </p>
    );
  }

  return (
    <>
      {articles.map((article) => (
        <StoriesCardHorizontal
          key={article.$id}
          article={article}
          isLiked={likes.has(article.$id)}
          isBookmarked={bookmarks.has(article.$id)}
          onLike={onLike}
          onBookmark={onBookmark}
        />
      ))}
    </>
  );
}
