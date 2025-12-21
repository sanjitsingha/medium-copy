"use client";

import Link from "next/link";
import { RiFireLine } from "react-icons/ri";
import { storage } from "@/lib/appwrite";
import { IoIosShareAlt } from "react-icons/io";
import { IoBookmarkOutline } from "react-icons/io5";
import { IoBookmark } from "react-icons/io5";
const BUCKET_ID = "article-images";

export default function StoriesCardHorizontal({
  article,
  isLiked,
  isBookmarked,
  onLike,
  onBookmark,
}) {
  const getImageUrl = (fileId) =>
    fileId ? storage.getFileView(BUCKET_ID, fileId).toString() : null;

  const imageUrl = getImageUrl(article.featuredImage);
  const avatarUrl = getImageUrl(article.authorAvatar);

  return (
    <div className="border-b border-gray-300 pb-8 mb-8">
      {/* Author */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200">
          {avatarUrl && <img src={avatarUrl} alt="" />}
        </div>
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
      <div className="flex gap-8 mt-2 text-gray-500">
        <button
          onClick={() => onLike(article.$id)}
          className={
            isLiked
              ? "bg-orange-400 rounded-full p-1 text-white cursor-pointer"
              : "cursor-pointer"
          }
        >
          <RiFireLine size={22} />
        </button>

        <button>
          <IoIosShareAlt size={16} />
        </button>

        <button
          onClick={() => onBookmark(article.$id)}
          className="cursor-pointer"
        >
          {isBookmarked ? (
            <IoBookmark size={18} className="text-green-700" />
          ) : (
            <IoBookmarkOutline size={18} className="text-gray-500" />
          )}
        </button>
      </div>
    </div>
  );
}
