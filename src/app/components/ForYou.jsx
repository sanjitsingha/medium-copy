"use client";

import { useEffect, useState } from "react";
import StoriesCardHorizontal from "./StoriesCardHorizontal";
import ShimmerArticle from "./ShimmerArticle";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useAuthContext } from "@/context/AuthContext";
import useUserActions from "@/hooks/useUserActions";

export default function ForYou() {
  const { user } = useAuthContext();
  const { likes, bookmarks, toggleLike, toggleBookmark } = useUserActions(user);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchForYou = async () => {
      setLoading(true);

      const { data: profile } = await supabase
        .from("users")
        .select("interests")
        .eq("id", user.id)
        .single();

      const interests = Array.isArray(profile?.interests)
        ? profile.interests
        : [];

      let query = supabase
        .from("articles")
        .select(
          `
            *,
            users (
              id,
              name,
              username,
              avatar
            )
          `,
        )
        .eq("status", "published")
        .order("updated_at", { ascending: false })
        .limit(10);

      if (interests.length > 0) {
        query = query.overlaps("categories", interests);
      }

      const { data, error } = await query;

      if (error) {
        console.error("For You feed error:", error);
        setArticles([]);
      } else {
        setArticles(
          (data || []).map((article) => ({
            ...article,
            author_name: article.users?.name || "Unknown",
            author_username: article.users?.username || article.users?.id,
            author_avatar: article.users?.avatar || null,
            thumbnail: article.cover_image
              ? getImageUrl(article.cover_image)
              : null,
          })),
        );
      }

      setLoading(false);
    };

    fetchForYou();
  }, [user]);

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
      <div>
        <p className="text-sm text-gray-500">
          No stories match your interests yet.
        </p>
        <Link
          className="text-sm bg-black text-white rounded-full px-4 py-2 block w-fit mt-4"
          href="/explore"
        >
          Explore Now
        </Link>
      </div>
    );
  }

  return (
    <>
      {articles.map((article) => (
        <StoriesCardHorizontal
          key={article.id}
          article={article}
          isLiked={likes.has(article.id)}
          isBookmarked={bookmarks.has(article.id)}
          onLike={toggleLike}
          onBookmark={toggleBookmark}
        />
      ))}
    </>
  );
}
