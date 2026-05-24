"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { PiThumbsUp, PiThumbsUpFill } from "react-icons/pi";
import { IoBookmarkOutline, IoBookmark } from "react-icons/io5";
import { useAuthContext } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { TbBookmarks, TbBookmarksFilled } from "react-icons/tb";
import {
  AiFillLike,
  AiOutlineLike,
  AiFillDislike,
  AiOutlineDislike,
} from "react-icons/ai";

function StoriesCardHorizontal({
  article,
  isLiked,
  isBookmarked,
  onLike,
  onBookmark,
}) {
  const { user } = useAuthContext();
  const handleLike = React.useCallback(
    () => onLike(article.id),
    [onLike, article.id],
  );
  const handleBookmark = React.useCallback(
    () => onBookmark(article.id),
    [onBookmark, article.id],
  );

  /* ================= IMAGE HELPERS ================= */
  const getImageUrl = (path) => {
    if (!path) return null;

    const { data } = supabase.storage.from("article-images").getPublicUrl(path);

    return data.publicUrl;
  };

  const imageUrl = article.thumbnail || getImageUrl(article.featured_image);
  const avatarPhoto = article.author_avatar;

  return (
    <div className="border-b border-gray-200  mb-8">
      {/* ================= AUTHOR ================= */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <Link
          href={`/profile/${article.author_username || article.author_id}`}
          className="flex items-center gap-3 group"
        >
          <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200">
            {avatarPhoto && (
              <Image
                src={avatarPhoto}
                alt="author"
                width={24}
                height={24}
                className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
              />
            )}
          </div>

          <p className="group-hover:text-black transition-colors font-medium">
            {user?.id === article.author_id
              ? user?.user_metadata?.name || "You"
              : article.author_name}
          </p>
        </Link>

        <span>·</span>

        <p>
          {article.updated_at
            ? new Date(article.updated_at).toDateString()
            : ""}
        </p>
      </div>

      {/* ================= CONTENT ================= */}
      <Link href={`/read/${article.slug}`}>
        <div className="flex gap-2 mt-2 cursor-pointer">
          <div className="flex-1">
            <h2 className="text-[22px] md:text-[24px] font-creato font-semibold text-black line-clamp-2 md:line-clamp-none">
              {article.title}
            </h2>

            <p className="text-sm text-gray-500 mt-4 line-clamp-2">
              {article.content?.replace(/<[^>]*>/g, "").slice(0, 220)}…
            </p>
          </div>

          {imageUrl && (
            <Image
              src={imageUrl}
              alt={article.title}
              width={600}
              height={400}
              className="w-[130px] h-[70px] md:w-[180px] md:h-[120px] object-cover rounded"
            />
          )}
        </div>
      </Link>

      {/* ================= ACTIONS ================= */}
      <div className="flex gap-8 my-4 text-gray-500">
        {/* LIKE */}
        <button
          onClick={handleLike}
          className="cursor-pointer transition-transform active:scale-95"
        >
          {isLiked ? (
            <AiFillLike size={22} className="text-black" />
          ) : (
            <AiOutlineLike
              size={22}
              className="text-gray-500 hover:text-black transition-colors"
            />
          )}
        </button>

        {/* BOOKMARK */}
        <button
          onClick={() => onBookmark(article.id)}
          className="cursor-pointer transition-transform active:scale-95"
        >
          {isBookmarked ? (
            <TbBookmarksFilled size={22} className="text-black" />
          ) : (
            <TbBookmarks
              size={22}
              className="text-gray-500 hover:text-black transition-colors"
            />
          )}
        </button>
      </div>
    </div>
  );
}
export default React.memo(StoriesCardHorizontal);
