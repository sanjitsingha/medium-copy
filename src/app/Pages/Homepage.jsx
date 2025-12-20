"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { databases, storage, ID } from "@/lib/appwrite";
import { Query } from "appwrite";
import { useAuthContext } from "@/context/AuthContext";
import { RiFireLine, RiFireFill } from "react-icons/ri";

import { IoBulbOutline, IoBookmarkOutline } from "react-icons/io5";
import { IoIosShareAlt } from "react-icons/io";

import ShimmerArticle from "../components/ShimmerArticle";
import YourReadingLIst from "../components/YourReadingLIst";

const DB_ID = "693d3d220017a846a1c0";
const ARTICLES_COLLECTION = "articles";
const LIKES_COLLECTION = "article_likes";
const BOOKMARKS_COLLECTION = "article_bookmarks";
const BUCKET_ID = "article-images";

export default function Homepage() {
  const { user } = useAuthContext();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("explore");

  const [userLikes, setUserLikes] = useState(new Set());
  const [userBookmarks, setUserBookmarks] = useState(new Set());

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1️⃣ Fetch published articles
        const articlesRes = await databases.listDocuments(
          DB_ID,
          ARTICLES_COLLECTION,
          [
            Query.equal("status", ["published"]),
            Query.orderDesc("$updatedAt"),
            Query.limit(10),
          ]
        );

        setArticles(articlesRes.documents);

        // 2️⃣ Fetch likes & bookmarks (if logged in)
        if (user?.$id) {
          const likesRes = await databases.listDocuments(
            DB_ID,
            LIKES_COLLECTION,
            [Query.equal("userId", [user.$id])]
          );

          const bookmarksRes = await databases.listDocuments(
            DB_ID,
            BOOKMARKS_COLLECTION,
            [Query.equal("userId", [user.$id])]
          );

          setUserLikes(new Set(likesRes.documents.map(l => l.articleId)));
          setUserBookmarks(new Set(bookmarksRes.documents.map(b => b.articleId)));
        }
      } catch (err) {
        console.error("Homepage fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.$id]);

  /* ================= LIKE TOGGLE ================= */
  const toggleLike = async (articleId) => {
    if (!user) return alert("Login to like");

    if (userLikes.has(articleId)) {
      const res = await databases.listDocuments(
        DB_ID,
        LIKES_COLLECTION,
        [
          Query.equal("articleId", [articleId]),
          Query.equal("userId", [user.$id]),
        ]
      );

      await databases.deleteDocument(
        DB_ID,
        LIKES_COLLECTION,
        res.documents[0].$id
      );

      setUserLikes(prev => {
        const s = new Set(prev);
        s.delete(articleId);
        return s;
      });
    } else {
      await databases.createDocument(DB_ID, LIKES_COLLECTION, ID.unique(), {
        articleId,
        userId: user.$id,
      });

      setUserLikes(prev => new Set(prev).add(articleId));
    }
  };

  /* ================= BOOKMARK TOGGLE ================= */
  const toggleBookmark = async (articleId) => {
    if (!user) return alert("Login to bookmark");

    if (userBookmarks.has(articleId)) {
      const res = await databases.listDocuments(
        DB_ID,
        BOOKMARKS_COLLECTION,
        [
          Query.equal("articleId", [articleId]),
          Query.equal("userId", [user.$id]),
        ]
      );

      await databases.deleteDocument(
        DB_ID,
        BOOKMARKS_COLLECTION,
        res.documents[0].$id
      );

      setUserBookmarks(prev => {
        const s = new Set(prev);
        s.delete(articleId);
        return s;
      });
    } else {
      await databases.createDocument(DB_ID, BOOKMARKS_COLLECTION, ID.unique(), {
        articleId,
        userId: user.$id,
      });

      setUserBookmarks(prev => new Set(prev).add(articleId));
    }
  };

  /* ================= HELPERS ================= */
  const getImageUrl = (fileId) =>
    fileId ? storage.getFileView(BUCKET_ID, fileId).toString() : null;

  /* ================= UI ================= */
  return (
    <div className="w-full">
      <div className="w-full max-w-[1200px] mx-auto px-4 flex gap-10">

        {/* ================= LEFT FEED ================= */}
        <div className="flex-1 pt-4">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-8 flex gap-8">
            {["explore", "for-you"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 text-sm ${
                  activeTab === tab
                    ? "text-black border-b-2 border-black"
                    : "text-gray-500"
                }`}
              >
                {tab === "explore" ? "Explore" : "For You"}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading &&
            Array.from({ length: 5 }).map((_, i) => (
              <ShimmerArticle key={i} />
            ))}

          {/* Articles */}
          {!loading &&
            articles.map(article => {
              const imageUrl = getImageUrl(article.featuredImage);

              return (
                <div key={article.$id} className="border-b pb-8 mb-8">
                  {/* Author */}
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <p>{article.authorName}</p>
                    <span>·</span>
                    <p>{new Date(article.$updatedAt).toDateString()}</p>
                  </div>

                  {/* Content */}
                  <Link href={`/read/${article.slug}`}>
                    <div className="flex gap-4 mt-2 cursor-pointer">
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold tracking-tight">
                          {article.title}
                        </h2>
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                          {article.content.replace(/<[^>]*>/g, "").slice(0, 220)}…
                        </p>
                      </div>

                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt={article.title}
                          className="w-[180px] h-[120px] object-cover rounded"
                        />
                      )}
                    </div>
                  </Link>

                  {/* Actions */}
                  <div className="flex gap-8 mt-4 text-gray-500">
                    <button
                      onClick={() => toggleLike(article.$id)}
                      className={userLikes.has(article.$id) ? "text-orange-400 " : ""}
                    >
                      <RiFireLine size={22} />
                    </button>

                    <button>
                      <IoIosShareAlt size={16} />
                    </button>

                    <button
                      onClick={() => toggleBookmark(article.$id)}
                      className={userBookmarks.has(article.$id) ? "text-black" : ""}
                    >
                      <IoBookmarkOutline size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>

        {/* ================= RIGHT SIDEBAR ================= */}
        <div className="hidden lg:block w-[320px] pt-6 border-l pl-6">
          <div className="sticky top-[90px]">
            <YourReadingLIst />
          </div>
        </div>
      </div>
    </div>
  );
}
