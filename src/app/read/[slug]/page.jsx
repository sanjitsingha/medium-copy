"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { databases, storage, ID } from "@/lib/appwrite";
import { Query, Permission, Role } from "appwrite";
import HTMLReactParser from "html-react-parser";
import { GoBookmark, GoBookmarkFill } from "react-icons/go";
import { IoBulbOutline } from "react-icons/io5";
import { IoIosShareAlt } from "react-icons/io";
import { useAuthContext } from "@/context/AuthContext";
import RelatedArticles from "@/app/components/RelatedArticles";

const DATABASE_ID = "693d3d220017a846a1c0";
const ARTICLES_COLLECTION = "articles";
const BUCKET_ID = "article-images";

export default function ReadArticlePage() {
  const { slug } = useParams();
  const { user } = useAuthContext();
  const readTimerRef = useRef(null);

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeDocId, setLikeDocId] = useState(null);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkDocId, setBookmarkDocId] = useState(null);

  const getAvatarUrl = (fileId) => {
    if (!fileId) return "/default-avatar.png";
    return storage.getFileView(BUCKET_ID, fileId).toString();
  };

  /* ---------------- FETCH ARTICLE ---------------- */
  useEffect(() => {
    if (!slug) return;

    const fetchArticle = async () => {
      try {
        const res = await databases.listDocuments(
          DATABASE_ID,
          ARTICLES_COLLECTION,
          [Query.equal("slug", [slug])]
        );

        if (!res.documents.length) return;

        const doc = res.documents[0];
        setArticle(doc);
        setLikesCount(doc.likes || 0);
      } catch (err) {
        console.error("Fetch article failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  /* ---------------- VIEW COUNT (once/session) ---------------- */
  useEffect(() => {
    if (!article?.$id) return;

    const viewed = sessionStorage.getItem(`viewed_${article.$id}`);
    if (viewed) return;

    databases.updateDocument(
      DATABASE_ID,
      ARTICLES_COLLECTION,
      article.$id,
      { views: (article.views || 0) + 1 }
    ).catch(console.error);

    sessionStorage.setItem(`viewed_${article.$id}`, "true");
  }, [article?.$id]);

  /* ---------------- READ COUNT (30s timer) ---------------- */
  useEffect(() => {
    if (!article?.$id) return;

    const read = sessionStorage.getItem(`read_${article.$id}`);
    if (read) return;

    readTimerRef.current = setTimeout(() => {
      databases.updateDocument(
        DATABASE_ID,
        ARTICLES_COLLECTION,
        article.$id,
        { reads: (article.reads || 0) + 1 }
      ).catch(console.error);

      sessionStorage.setItem(`read_${article.$id}`, "true");
    }, 30000);

    return () => clearTimeout(readTimerRef.current);
  }, [article?.$id]);

  /* ---------------- LIKE & BOOKMARK STATUS ---------------- */
  useEffect(() => {
    if (!user || !article?.$id) return;

    const initStatus = async () => {
      try {
        const [likesRes, bookmarkRes] = await Promise.all([
          databases.listDocuments(DATABASE_ID, "article_likes", [
            Query.equal("articleId", [article.$id]),
            Query.equal("userId", [user.$id]),
          ]),
          databases.listDocuments(DATABASE_ID, "article_bookmarks", [
            Query.equal("articleId", [article.$id]),
            Query.equal("userId", [user.$id]),
          ]),
        ]);

        if (likesRes.documents.length) {
          setIsLiked(true);
          setLikeDocId(likesRes.documents[0].$id);
        }

        if (bookmarkRes.documents.length) {
          setIsBookmarked(true);
          setBookmarkDocId(bookmarkRes.documents[0].$id);
        }
      } catch (err) {
        console.error("Status check failed:", err);
      }
    };

    initStatus();
  }, [user, article?.$id]);

  /* ---------------- LIKE TOGGLE ---------------- */
  const toggleLike = async () => {
    if (!user) return alert("Please login to like");

    try {
      if (isLiked) {
        await databases.deleteDocument(
          DATABASE_ID,
          "article_likes",
          likeDocId
        );

        await databases.updateDocument(
          DATABASE_ID,
          ARTICLES_COLLECTION,
          article.$id,
          { likes: Math.max(likesCount - 1, 0) }
        );

        setLikesCount((v) => Math.max(v - 1, 0));
        setIsLiked(false);
        setLikeDocId(null);
      } else {
        const doc = await databases.createDocument(
          DATABASE_ID,
          "article_likes",
          ID.unique(),
          { articleId: article.$id, userId: user.$id },
          [
            Permission.read(Role.user(user.$id)),
            Permission.delete(Role.user(user.$id)),
          ]
        );

        await databases.updateDocument(
          DATABASE_ID,
          ARTICLES_COLLECTION,
          article.$id,
          { likes: likesCount + 1 }
        );

        setLikesCount((v) => v + 1);
        setIsLiked(true);
        setLikeDocId(doc.$id);
      }
    } catch (err) {
      console.error("Like toggle failed:", err);
    }
  };

  /* ---------------- BOOKMARK TOGGLE ---------------- */
  const toggleBookmark = async () => {
    if (!user) return alert("Please login to bookmark");

    try {
      if (isBookmarked) {
        await databases.deleteDocument(
          DATABASE_ID,
          "article_bookmarks",
          bookmarkDocId
        );
        setIsBookmarked(false);
        setBookmarkDocId(null);
      } else {
        const doc = await databases.createDocument(
          DATABASE_ID,
          "article_bookmarks",
          ID.unique(),
          { articleId: article.$id, userId: user.$id },
          [
            Permission.read(Role.user(user.$id)),
            Permission.delete(Role.user(user.$id)),
          ]
        );

        setIsBookmarked(true);
        setBookmarkDocId(doc.$id);
      }
    } catch (err) {
      console.error("Bookmark toggle failed:", err);
    }
  };

  /* ---------------- RENDER ---------------- */
  if (loading) return <p className="text-center mt-20">Loading article…</p>;
  if (!article) return <p className="text-center mt-20">Article not found</p>;

  const imageUrl = article.featuredImage
    ? storage.getFileView(BUCKET_ID, article.featuredImage).toString()
    : null;

  return (
    <div className="max-w-[800px] p-4 md:p-0 mx-auto pt-2">
      <div className="bg-gray-200 w-full h-[120px] mt-10 rounded-sm flex items-center justify-center">
        <p className="text-gray-500">Advertisment Area</p>
      </div>

      <h1 className=" text-[28px] md:text-[42px] font-serif pt-6 leading-tight">
        {article.title}
      </h1>

      {/* AUTHOR SECTION */}
      <div className="w-full flex border-l-6 pl-4 border-green-600 my-8 justify-between">
        <div className="text-gray-500 text-xs md:text-sm flex gap-1 md:gap-4 items-center">
          <img
            src={getAvatarUrl(article.authorAvatar)}
            className="w-6 h-6 rounded-full object-cover"
            alt={article.authorName}
          />
          <p>{article.authorName || "Admin"}</p>
          <p>{new Date(article.$createdAt).toDateString()}</p>
          <p>{article.readTime} min read</p>
        </div>

        <button onClick={toggleBookmark}>
          {isBookmarked ? <GoBookmarkFill size={22} /> : <GoBookmark size={22} />}
        </button>
      </div>

      {imageUrl && (
        <img src={imageUrl} className="w-full my-8 rounded" alt={article.title} />
      )}

      <div className="prose prose-lg max-w-none text-[14px] md:text-[20px]">
        {HTMLReactParser(article.content)}
      </div>

      {/* LIKE / SHARE */}
      <div className="mt-10 flex justify-end gap-8">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLike}
            className={`h-8 w-8 rounded-full flex items-center justify-center ${
              isLiked ? "bg-green-600 text-white" : "bg-gray-300"
            }`}
          >
            <IoBulbOutline size={18} />
          </button>
          <span className="text-sm text-gray-500">{likesCount}</span>
        </div>

        <button className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
          <IoIosShareAlt size={18} />
        </button>
      </div>

      <div className="bg-gray-200 w-full h-[120px] mt-10 rounded-sm flex items-center justify-center">
        <p className="text-gray-500 text-sm">Advertisment Area</p>
      </div>

      <div className="w-full py-10">
        <p className="text-[22px] font-semibold tracking-tighter">
          Related Stories
        </p>
        <RelatedArticles
          categories={article.categories}
          currentId={article.$id}
        />
      </div>
    </div>
  );
}
