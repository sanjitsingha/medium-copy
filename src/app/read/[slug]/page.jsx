"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import HTMLReactParser from "html-react-parser";
import Link from "next/link";
import Image from "next/image";
import localFont from "next/font/local";
import { AiFillLike, AiOutlineLike } from "react-icons/ai";
import { RxShare2 } from "react-icons/rx";
import { TbBookmarks, TbBookmarksFilled } from "react-icons/tb";
import { useAuthContext } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import { buildAnalyticsPayload } from "@/lib/analyticsHelpers";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { FaRegComment } from "react-icons/fa6";
import useUserActions from "@/hooks/useUserActions";
import RelatedArticles from "@/app/components/RelatedArticles";

const sourceSerif = localFont({
  src: [
    {
      path: "../../../../public/fonts/SourceSerifPro-Regular.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../../public/fonts/SourceSerifPro-Bold.woff",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
});

export default function ReadArticlePage() {
  const { slug } = useParams();
  const { user } = useAuthContext();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState(null);
  const commentsRef = useRef(null);

  const { likes, bookmarks, toggleLike, toggleBookmark } = useUserActions(user);
  const isLiked = likes.has(article?.id);
  const isBookmarked = bookmarks.has(article?.id);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) return;

      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      setProfile(data);
    };

    fetchProfile();
  }, []);

  // console.log(profile, "avatar", profile?.avatar);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const scrollableHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      setScrollProgress(
        scrollableHeight > 0 ? (totalScroll / scrollableHeight) * 100 : 0,
      );
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!slug) return;

    const fetchArticle = async () => {
      setLoading(true);
      const { data, error } = await supabase
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
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (error) {
        console.error("Fetch article failed:", error);
        setArticle(null);
      } else {
        setArticle(data);
      }

      setLoading(false);
    };

    fetchArticle();
  }, [slug]);

  const fetchComments = async (articleId) => {
    console.log("Fetching comments for:", articleId);

    // Test 1: Simple fetch to see if table exists
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("article_id", articleId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("FETCH ERROR MESSAGE:", error.message);
      console.error("FETCH ERROR CODE:", error.code);
      console.error("FETCH ERROR DETAILS:", error.details);
    } else {
      console.log("Successfully fetched raw comments:", data?.length);

      // Test 2: Try fetching with user info if raw fetch worked
      const { data: enrichedData, error: enrichedError } = await supabase
        .from("comments")
        .select(
          `
          *,
          users:user_id (name, avatar),
          comment_likes (user_id)
        `,
        )
        .eq("article_id", articleId)
        .order("created_at", { ascending: false });

      if (enrichedError) {
        console.error("ENRICHED FETCH ERROR:", enrichedError.message);
        setComments(data || []); // Fallback to raw data
      } else {
        setComments(enrichedData || []);
      }
    }
  };

  useEffect(() => {
    if (article?.id) {
      fetchComments(article.id);
    }
  }, [article?.id, user?.id]);

  useEffect(() => {
    if (!article?.id) return;

    const trackView = async () => {
      const storageKey = `viewed_${article.id}`;
      const lastLocalView = parseInt(localStorage.getItem(storageKey), 10) || 0;
      const now = Date.now();
      const FIVE_MINUTES = 5 * 60 * 1000;
      let shouldTrack = true;
      let uniqueUser = false;

      if (user?.id) {
        const { data: lastView, error: lastViewError } = await supabase
          .from("views")
          .select("created_at")
          .eq("article_id", article.id)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (lastViewError) {
          console.error("VIEW QUERY ERROR:", lastViewError);
        }

        uniqueUser = !lastView?.created_at;

        if (lastView?.created_at) {
          const lastViewTime = new Date(lastView.created_at).getTime();
          if (now - lastViewTime < FIVE_MINUTES) {
            shouldTrack = false;
          }
        }
      } else {
        if (now - lastLocalView < FIVE_MINUTES) {
          shouldTrack = false;
        }
      }

      if (!shouldTrack) return;

      const meta = await buildAnalyticsPayload();
      const { error } = await supabase.from("views").insert([
        {
          article_id: article.id,
          user_id: user?.id || null,
          unique_user: uniqueUser,
          ...meta,
        },
      ]);

      if (error && error.code !== "23505") {
        console.error("VIEW ERROR:", error);
      }

      localStorage.setItem(storageKey, now.toString());
    };

    trackView();
  }, [article?.id, user?.id]);

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      await navigator.share({
        title: article.title,
        text: article.title,
        url,
      });
      return;
    }

    await navigator.clipboard.writeText(url);
    alert("Link copied to clipboard");
  };

  const scrollToComments = () => {
    commentsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePostComment = async () => {
    if (!user) {
      alert("Please sign in to comment");
      return;
    }
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    const { error } = await supabase.from("comments").insert([
      {
        article_id: article.id,
        user_id: user.id,
        content: commentText.trim(),
      },
    ]);

    if (error) {
      console.error("POST ERROR MESSAGE:", error.message);
      console.error("POST ERROR CODE:", error.code);
      alert(`Failed to post comment: ${error.message || "Check console"}`);
    } else {
      setCommentText("");
      fetchComments(article.id);
    }
    setIsSubmitting(false);
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this response?"))
      return;

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      alert("Failed to delete comment");
    } else {
      fetchComments(article.id);
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editText.trim()) return;
    setIsSubmitting(true);
    const { error } = await supabase
      .from("comments")
      .update({ content: editText.trim() })
      .eq("id", commentId);

    if (error) {
      alert("Failed to update comment");
    } else {
      setEditingId(null);
      fetchComments(article.id);
    }
    setIsSubmitting(false);
  };

  const handlePostReply = async (parentId) => {
    if (!user) {
      alert("Please sign in to reply");
      return;
    }
    if (!replyText.trim()) return;

    setIsSubmitting(true);
    const { error } = await supabase.from("comments").insert([
      {
        article_id: article.id,
        user_id: user.id,
        content: replyText.trim(),
        parent_id: parentId,
      },
    ]);

    if (error) {
      console.error("POST REPLY ERROR:", error);
      alert("Failed to post reply");
    } else {
      setReplyText("");
      setReplyingTo(null);
      fetchComments(article.id);
    }
    setIsSubmitting(false);
  };

  const toggleCommentLike = async (commentId, isLiked) => {
    if (!user) {
      alert("Please sign in to like comments");
      return;
    }

    if (isLiked) {
      const { error } = await supabase
        .from("comment_likes")
        .delete()
        .eq("comment_id", commentId)
        .eq("user_id", user.id);
      if (error) console.error("UNLIKE ERROR:", error);
    } else {
      const { error } = await supabase
        .from("comment_likes")
        .insert([{ comment_id: commentId, user_id: user.id }]);
      if (error) console.error("LIKE ERROR:", error);
    }
    fetchComments(article.id);
  };

  if (loading) {
    return <p className="text-center mt-20">Loading...</p>;
  }

  if (!article) {
    return (
      <div>
        <p className="text-center text-black font-bold text-3xl mt-20">
          Article not found
        </p>
        <Link
          href="/explore"
          className="text-gray-600 mx-auto w-fit mt-3 block hover:underline"
        >
          Back to Explore
        </Link>
      </div>
    );
  }

  const authorName = article.users?.name || "Author";
  const avatar = article.users?.avatar || "/placeholder.png";
  const readingTime = Math.max(
    1,
    Math.ceil(
      (article.content?.replace(/<[^>]*>?/gm, "").length || 1000) / 1000,
    ),
  );

  return (
    <div className="max-w-[800px] p-4 md:p-0 mx-auto pt-2 pb-24 md:pb-0">
      <div className="fixed top-0 left-0 w-full h-1 z-[100] bg-transparent">
        <div
          className="h-full bg-black transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <h1 className="text-2xl md:text-[40px] font-creato font-bold text-black mt-12 mb-4 leading-tight">
        {article.title}
      </h1>

      <p className="text-lg font-creato text-black/60">
        {article.meta_description}
      </p>

      <div className="flex justify-between mt-6 mb-2 border-t border-b border-gray-100 py-3">
        <Link
          href={`/profile/${article.users?.username || article.author_id}`}
          className="text-gray-500 text-[15px] flex gap-3 items-center group"
        >
          <Image
            src={avatar}
            width={38}
            height={38}
            title={authorName}
            alt={authorName}
            className="rounded-full object-cover border border-gray-100 group-hover:opacity-80 transition-opacity"
          />
          <div className="flex flex-col">
            <p className="text-black font-medium leading-tight group-hover:text-gray-600 transition-colors">
              {authorName}
            </p>
            <div className="flex items-center gap-2 text-[12px] text-gray-400">
              <p>{readingTime} min read</p>
              <span>-</span>
              <p>
                {new Date(article.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </Link>
      </div>

      <div className="md:static fixed bottom-0 left-0 w-full md:w-auto z-50 md:z-auto bg-white md:bg-transparent border-t md:border-t-0 md:border-b border-gray-100 py-3 md:py-2 px-6 md:px-0 md:mb-8 transition-all">
        <div className="max-w-[800px] mx-auto w-full h-10 gap-6 flex justify-center md:justify-start items-center">
          <button
            title="like"
            onClick={() => toggleLike(article.id)}
            className="cursor-pointer transition-transform active:scale-95 flex items-center gap-2 text-sm text-gray-500"
          >
            {isLiked ? (
              <AiFillLike size={21} className="text-black" />
            ) : (
              <AiOutlineLike
                size={21}
                className="text-gray-500 hover:text-black transition-colors"
              />
            )}
            Like
          </button>

          <button
            title="bookmark"
            onClick={() => toggleBookmark(article.id)}
            className="cursor-pointer transition-transform active:scale-95 flex items-center gap-2 text-sm text-gray-500"
          >
            {isBookmarked ? (
              <TbBookmarksFilled size={21} className="text-black" />
            ) : (
              <TbBookmarks
                size={21}
                className="text-gray-500 transition-colors"
              />
            )}
            Save
          </button>

          <button
            title="share"
            onClick={handleShare}
            className="cursor-pointer transition-transform active:scale-95 flex items-center gap-2 text-sm text-gray-500"
          >
            <RxShare2
              size={19}
              className="text-gray-500 hover:text-black transition-colors"
            />
            Share
          </button>
        </div>
      </div>

      {article.cover_image && (
        <Image
          width={600}
          height={400}
          priority
          src={article.cover_image}
          className="w-full rounded my-8 object-cover"
          alt={article.title}
        />
      )}

      <div
        className={`prose max-w-none text-xl leading-8 tracking-tight text-black ${sourceSerif.className}`}
      >
        {HTMLReactParser(sanitizeHtml(article.content))}
      </div>

      {article.categories?.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2">
          {article.categories.map((cat) => (
            <Link
              key={cat}
              href={`/explore?category=${encodeURIComponent(cat)}`}
              className="px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-xs border border-gray-100 hover:bg-gray-100 transition-colors"
            >
              {cat}
            </Link>
          ))}
        </div>
      )}

      <div className="py-10">
        <hr className="my-6" />
        <p className="text-xl font-semibold mb-8 text-black">Related Stories</p>
        <RelatedArticles
          categories={article.categories}
          currentId={article.id}
        />
      </div>
    </div>
  );
}
