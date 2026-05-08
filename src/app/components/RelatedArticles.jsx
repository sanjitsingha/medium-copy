"use client";

import { useEffect, useState } from "react";
import StoriesCard from "./StoriesCard";
import { supabase } from "@/lib/supabaseClient";

export default function RelatedArticles({ categories, currentId }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (!categories?.length || !currentId) return;

    const fetchRelated = async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(
          `
            *,
            users (
              name,
              avatar
            )
          `
        )
        .eq("status", "published")
        .neq("id", currentId)
        .overlaps("categories", categories)
        .limit(4);

      if (error) {
        console.error("Related fetch failed", error);
        setPosts([]);
      } else {
        setPosts(data || []);
      }
    };

    fetchRelated();
  }, [categories, currentId]);

  if (!posts.length) return null;

  return (
    <div className="mt-4 grid md:grid-cols-2 grid-cols-1 gap-10">
      {posts.map((post) => (
        <StoriesCard key={post.id} post={post} />
      ))}
    </div>
  );
}
