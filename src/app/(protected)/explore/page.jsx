"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthContext } from "@/context/AuthContext";
import useUserActions from "@/hooks/useUserActions";
import ShimmerArticle from "@/app/components/ShimmerArticle";
import StoriesCardHorizontal from "@/app/components/StoriesCardHorizontal";

const CATEGORIES = [
  "Technology",
  "Startups",
  "Design",
  "Ai",
  "Health",
  "Productivity",
  "Business",
];

export default function Page() {
  const searchParams = useSearchParams();

  const { user } = useAuthContext();
  const { likes, bookmarks, toggleLike, toggleBookmark } = useUserActions(user);

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategories, setActiveCategories] = useState([]);
  const [isReady, setIsReady] = useState(false);

  /* ================= IMAGE HELPER ================= */
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;

    const { data } = supabase.storage.from("article-images").getPublicUrl(path);

    return data.publicUrl;
  };

  /* ================= READ FROM URL ================= */
  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");

    if (categoryFromUrl) {
      setActiveCategories([categoryFromUrl]);
    }

    setIsReady(true);
  }, [searchParams]);

  /* ================= FETCH ARTICLES ================= */
  useEffect(() => {
    if (!isReady) return;

    const fetchArticles = async () => {
      setLoading(true);

      try {
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
          .limit(20);

        if (activeCategories.length > 0) {
          // Filter articles where categories array contains ANY of the activeCategories
          query = query.overlaps("categories", activeCategories);
        }

        const { data, error } = await query;

        if (error) throw error;

        const formatted = (data || []).map((article) => ({
          ...article,
          author_name: article.users?.name || "Unknown",
          author_username: article.users?.username || article.users?.id,
          author_avatar: article.users?.avatar
            ? getImageUrl(article.users.avatar)
            : null,
          thumbnail: article.cover_image
            ? getImageUrl(article.cover_image)
            : null,
        }));

        setArticles(formatted);
      } catch (err) {
        console.error("Explore fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [activeCategories, isReady]);

  /* ================= CATEGORY TOGGLE ================= */
  const toggleCategory = (category) => {
    setActiveCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  /* ================= UI ================= */
  return (
    <div className="w-full max-w-[900px] mx-auto px-4 pt-6">
      <h1 className="text-[22px] text-black font-semibold mb-6">Explore</h1>

      <div className="flex flex-wrap gap-3 mb-8">
        {CATEGORIES.map((cat) => {
          const active = activeCategories.includes(cat);

          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm border transition ${
                active
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 border-gray-300 hover:border-black"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {loading &&
        Array.from({ length: 5 }).map((_, i) => <ShimmerArticle key={i} />)}

      {!loading && articles.length === 0 && (
        <p className="text-sm text-gray-500">
          No stories found for selected categories.
        </p>
      )}

      {!loading &&
        articles.map((article) => (
          <StoriesCardHorizontal
            key={article.id}
            article={article}
            isLiked={likes.has(article.id)}
            isBookmarked={bookmarks.has(article.id)}
            onLike={toggleLike}
            onBookmark={toggleBookmark}
          />
        ))}
    </div>
  );
}
