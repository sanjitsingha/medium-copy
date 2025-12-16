"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { databases, storage, ID } from "@/lib/appwrite";
import { Query, Permission, Role } from "appwrite";
import HTMLReactParser from "html-react-parser";
import Link from "next/link";
import { GoBookmark } from "react-icons/go";
import { GoBookmarkFill } from "react-icons/go";
import { IoBulbOutline } from "react-icons/io5";
import { IoIosShareAlt } from "react-icons/io";
import { useAuthContext } from "@/context/AuthContext";

export default function ReadArticlePage() {
  const { user } = useAuthContext();

  const { slug } = useParams();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [likeDocId, setLikeDocId] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkDocId, setBookmarkDocId] = useState(null);

  useEffect(() => {
    if (!user || !article?.$id) return;

    const checkLikeStatus = async () => {
      try {
        const res = await databases.listDocuments(
          "693d3d220017a846a1c0",
          "article_likes",
          [
            Query.equal("articleId", [article.$id]),
            Query.equal("userId", [user.$id]),
          ]
        );

        if (res.documents.length > 0) {
          setIsLiked(true);
          setLikeDocId(res.documents[0].$id);
        }
      } catch (err) {
        console.error("Like check failed:", err);
      }
    };
    const checkBookmark = async () => {
      try {
        const res = await databases.listDocuments(
          "693d3d220017a846a1c0",
          "article_bookmarks",
          [
            Query.equal("articleId", [article.$id]),
            Query.equal("userId", [user.$id]),
          ]
        );

        if (res.documents.length > 0) {
          setIsBookmarked(true);
          setBookmarkDocId(res.documents[0].$id);
        } else {
          setIsBookmarked(false);
          setBookmarkDocId(null);
        }
      } catch (err) {
        console.error("Bookmark check failed:", err);
      }
    };

    checkLikeStatus();
    checkBookmark();
  }, [article?.$id, user]);

  useEffect(() => {
    if (!slug) return;

    const fetchArticle = async () => {
      try {
        const response = await databases.listDocuments(
          "693d3d220017a846a1c0", // DATABASE ID
          "articles", // COLLECTION ID
          [Query.equal("slug", [slug])]
        );

        if (response.documents.length > 0) {
          setArticle(response.documents[0]);
        }
      } catch (error) {
        console.error("Fetch article error:", error);
      } finally {
        setLoading(false);
        if (article?.likes !== undefined) {
          setLikesCount(article.likes);
        }
      }
    };

    fetchArticle();
  }, [slug, article]);

  const toggleLike = async () => {
    if (!user) {
      alert("Please login to like this article");
      return;
    }

    try {
      // UNLIKE
      if (isLiked) {
        await databases.deleteDocument(
          "693d3d220017a846a1c0",
          "article_likes",
          likeDocId
        );

        await databases.updateDocument(
          "693d3d220017a846a1c0",
          "articles",
          article.$id,
          {
            likes: Math.max(likesCount - 1, 0),
          }
        );

        setIsLiked(false);
        setLikesCount((prev) => Math.max(prev - 1, 0));
        setLikeDocId(null);
      }

      // LIKE
      else {
        const likeDoc = await databases.createDocument(
          "693d3d220017a846a1c0",
          "article_likes",
          ID.unique(),
          {
            articleId: article.$id,
            userId: user.$id,
          },
          [
            Permission.read(Role.user(user.$id)),
            Permission.delete(Role.user(user.$id)),
          ]
        );

        await databases.updateDocument(
          "693d3d220017a846a1c0",
          "articles",
          article.$id,
          {
            likes: likesCount + 1,
          }
        );

        setIsLiked(true);
        setLikesCount((prev) => prev + 1);
        setLikeDocId(likeDoc.$id);
      }
    } catch (err) {
      console.error("Toggle like error:", err);
    }
  };

  const toggleBookmark = async () => {
    if (!user) {
      alert("Please login to bookmark this article");
      return;
    }

    try {
      // REMOVE BOOKMARK
      if (isBookmarked && bookmarkDocId) {
        await databases.deleteDocument(
          "693d3d220017a846a1c0",
          "article_bookmarks",
          bookmarkDocId
        );

        setIsBookmarked(false);
        setBookmarkDocId(null);
      }

      // ADD BOOKMARK
      else {
        const doc = await databases.createDocument(
          "693d3d220017a846a1c0",
          "article_bookmarks",
          ID.unique(),
          {
            articleId: article.$id,
            userId: user.$id,
            // createdAt: new Date().toISOString(),
          },
          [
            Permission.read(Role.user(user.$id)),
            Permission.delete(Role.user(user.$id)),
          ]
        );

        setIsBookmarked(true);
        setBookmarkDocId(doc.$id);
      }
    } catch (err) {
      console.error("Toggle bookmark error:", err);
    }
  };

  if (loading) {
    return <p className="text-center mt-20">Loading article…</p>;
  }

  if (!article) {
    return <p className="text-center mt-20">Article not found</p>;
  }

  console.log(article);

  const imageUrl = article.featuredImage
    ? storage
        .getFileView(
          "article-images", // BUCKET ID
          article.featuredImage
        )
        .toString()
    : null;

  return (
    <div className="max-w-[800px] mx-auto pt-2">
      <div className="bg-gray-200 w-full h-[120px] mt-10 rounded-sm flex items-center justify-center">
        {/* THis div will be used to adverstement later on */}
        <p className="text-gray-500">Advertisment Area</p>
      </div>
      <h1 className="text-[42px] font-serif pt-6 leading-tight">
        {article.title}
      </h1>
      <div className="w-full flex border-l-6 pl-4 border-green-600 my-8 justify-between">
        <div className="text-gray-500 text-sm flex gap-4 items-center">
          <p>{article.authorName || "Admin"}</p>
          <p>{new Date(article.$createdAt).toDateString()}</p>
          <p>{article.readTime + "min Read"}</p>
        </div>
        <div>
          <button onClick={toggleBookmark} className="cursor-pointer">
            {isBookmarked ? (
              <GoBookmarkFill size={22} />
            ) : (
              <GoBookmark size={22} />
            )}
          </button>
        </div>
      </div>
      {imageUrl && (
        <img
          src={imageUrl}
          alt={article.title}
          className="w-full my-8 rounded"
        />
      )}

      <div className="prose prose-lg max-w-none">
        {HTMLReactParser(article.content)}
      </div>
      <div className=" mt-10 w-full  justify-end flex gap-8 h-full">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLike}
            className={`h-8 w-8 rounded-full flex items-center justify-center cursor-pointer ${
              isLiked ? "bg-green-600 text-white" : "bg-gray-300"
            }`}
          >
            <IoBulbOutline size={18} />
          </button>

          <span className="text-sm text-gray-500">{likesCount}</span>
        </div>
        <button className="bg-gray-300 h-8 w-8 rounded-full flex items-center justify-center cursor-pointer">
          <IoIosShareAlt size={18} />
        </button>
      </div>
      <div className="bg-gray-200 w-full h-[200px] mt-10 rounded-sm flex items-center justify-center">
        {/* THis div will be used to adverstement later on */}
        <p className="text-gray-500">Advertisment Area</p>
      </div>
      <div className="w-full border-l-6 pl-4 border-green-600  my-20">
        <p className="text-gray-500 text-sm">The Author:</p>
        <p className="text-[26px] font-serif mt-2">
          {article.authorName || "Admin"}
        </p>
        <p className="text-sm w-[70%] text-gray-500">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto,
          modi numquam. Veniam beatae excepturi ut pariatur eveniet, similique
          culpa delectus!
        </p>
      </div>
    </div>
  );
}
