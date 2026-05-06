"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import HTMLReactParser from "html-react-parser";
import { IoArrowRedoOutline, IoBookmark, IoBookmarkOutline } from "react-icons/io5";
import { useAuthContext } from "@/context/AuthContext";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import useUserActions from "@/hooks/useUserActions";
import { PiThumbsDown, PiThumbsDownFill, PiThumbsUp, PiThumbsUpFill } from "react-icons/pi";
import Image from "next/image";
import { TbBookmarks, TbBookmarksFilled } from "react-icons/tb";
import { AiFillLike, AiOutlineLike, AiFillDislike, AiOutlineDislike } from "react-icons/ai";
import { BsThreeDots } from "react-icons/bs";
import { PiArrowBendDoubleUpRight } from "react-icons/pi";
import { PiSealWarningLight } from "react-icons/pi";
import { RxShare2 } from "react-icons/rx";
import localFont from 'next/font/local';

const sourceSerif = localFont({
  src: [
    {
      path: '../../../../public/fonts/SourceSerifPro-Regular.woff',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../../../public/fonts/SourceSerifPro-Bold.woff',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
});





export default function ReadArticlePage() {
  const { slug } = useParams();
  const { user } = useAuthContext();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  const { likes, bookmarks, toggleLike, toggleBookmark } =
    useUserActions(user);
  const isLiked = likes.has(article?.id);
  const isBookmarked = bookmarks.has(article?.id);

  const isAuthor = user?.id === article?.author_id;





  const [activeMenu, setActiveMenu] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = `${(totalScroll / windowHeight) * 100}%`;
      setScrollProgress(scroll);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      setActiveMenu(null);
    };

    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);


  /* ---------------- FETCH ARTICLE ---------------- */
  useEffect(() => {
    if (!slug) return;

    const fetchArticle = async () => {
      try {
        const { data, error } = await supabase
          .from("articles")
          .select(`
            *,
            users (
              name,
              avatar
            )
          `)
          .eq("slug", slug)
          .single();

        if (error) throw error;

        setArticle(data);
      } catch (err) {
        console.error("Fetch article failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  /* ================= VIEW TRACKING (OPTIMIZED) ================= */
  useEffect(() => {
    if (!article?.id) return;

    const trackView = async () => {
      const storageKey = `viewed_${article.id}`;

      // ✅ prevent duplicate (guest + session)
      const alreadyViewed = localStorage.getItem(storageKey);
      if (alreadyViewed) return;

      // ✅ mark instantly (optimistic)
      localStorage.setItem(storageKey, "true");

      // Capture referrer source
      let referrer = null;
      try {
        const ref = document.referrer;
        if (ref) {
          const refUrl = new URL(ref);
          // Only store external referrers (not self-referrals)
          if (refUrl.hostname !== window.location.hostname) {
            referrer = refUrl.hostname;
          }
        }
      } catch (e) {
        // ignore invalid referrer URLs
      }

      const { error } = await supabase.from("views").insert([
        {
          article_id: article.id,
          user_id: user?.id || null,
          referrer: referrer,
        },
      ]);

      // ignore duplicate error
      if (error && error.code !== "23505") {
        console.error("VIEW ERROR:", error);
      }
    };

    trackView();
  }, [article?.id]);

  /* ---------------- SHARE ---------------- */
  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      await navigator.share({
        title: article.title,
        text: article.title,
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard");
    }
  };

  // console.log(article)


  const avatar = article?.users.avatar;
  const readingTime = article ? Math.max(1, Math.ceil((article.content?.replace(/<[^>]*>?/gm, '').length || 1000) / 1000)) : 0;
  /* ---------------- LOADING ---------------- */
  if (loading) {
    return <p className="text-center mt-20">Loading...</p>;
  }

  if (!article)
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

  const imageUrl = article.cover_image || null;

  return (
    <div className="max-w-[800px] p-4 md:p-0 mx-auto pt-2 pb-24 md:pb-0">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[100] bg-transparent">
        <div
          className="h-full bg-black transition-all duration-150 ease-out"
          style={{ width: scrollProgress }}
        />
      </div>

      <h1 className="text-2xl md:text-[40px] font-creato font-bold text-black mt-12 mb-4 leading-tight">
        {article.title}
      </h1>

      <p className="text-lg font-creato  text-black/60">
        {article.meta_description}
      </p>

      {/* AUTHOR */}
      <div className="flex justify-between mt-6 mb-2 border-t border-b border-gray-100 py-3">
        <div className="text-gray-500 text-[15px] flex gap-3 items-center">
          <Image
            src={avatar || "/placeholder.png"}
            width={38}
            height={38}
            title={article.users.name}
            alt={article.users.name}
            className="rounded-full object-cover border border-gray-100"
          />
          <div className="flex flex-col">
            <p className="text-black font-medium leading-tight">{article.users.name || "Author"}</p>
            <div className="flex items-center gap-2 text-[12px] text-gray-400">
              <p>{readingTime} min read</p>
              <span>•</span>
              <p>{new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Action Bar */}
      <div className="md:static fixed bottom-0 left-0 w-full md:w-auto z-50 md:z-auto bg-white md:bg-transparent border-t md:border-t-0 md:border-b border-gray-100 py-3 md:py-2 px-6 md:px-0 md:mb-8 transition-all">
        <div className="max-w-[800px] mx-auto w-full h-10 gap-6 flex justify-center md:justify-start items-center">
          <div className="flex items-center bg-white md:bg-transparent px-4 md:px-0 border md:border-0 border-gray-100 h-10 md:h-auto rounded-full gap-2 shadow-sm md:shadow-none">
            <button
              title="like"
              onClick={() => toggleLike(article.id)}
              className="cursor-pointer transition-transform active:scale-85 flex items-center gap-2"
            >
              <span>
                {isLiked ? (
                  <AiFillLike size={21} className="text-black" />
                ) : (
                  <AiOutlineLike
                    size={21}
                    className="text-gray-500 hover:text-black transition-colors"
                  />
                )}
              </span>
              <p className="text-sm font-creato text-gray-500">Like</p>
            </button>
          </div>

          <div className="flex items-center">
            <button
              title="bookmark"
              onClick={() => toggleBookmark(article.id)}
              className="cursor-pointer transition-transform flex h-10 md:h-auto px-4 md:px-0 items-center gap-2 border md:border-0 border-gray-100 bg-white md:bg-transparent rounded-full active:scale-85 shadow-sm md:shadow-none"
            >
              <span>
                {isBookmarked ? (
                  <TbBookmarksFilled size={21} className="text-black" />
                ) : (
                  <TbBookmarks
                    size={21}
                    className="text-gray-500 transition-colors"
                  />
                )}
              </span>
              <p className="text-sm font-creato text-gray-500">Save</p>
            </button>
          </div>

          <div className="flex items-center bg-white md:bg-transparent px-4 md:px-0 border md:border-0 border-gray-100 h-10 md:h-auto rounded-full gap-2 shadow-sm md:shadow-none">
            <button
              title="share"
              onClick={handleShare}
              className="cursor-pointer transition-transform active:scale-85 flex items-center gap-2"
            >
              <span>
                <RxShare2 size={19} className="text-gray-500 hover:text-black transition-colors" />
              </span>
              <p className="text-sm font-creato text-gray-500">Share</p>
            </button>
          </div>
        </div>
      </div>

      {imageUrl && (
        <Image
          width={700}
          height={500}
          priority
          objectFit="cover"
          src={imageUrl}
          className="w-full rounded my-8"
          alt={article.title}
        />
      )}

      <div className={`prose max-w-none text-xl leading-8 tracking-tight text-black ${sourceSerif.className}`}>
        {HTMLReactParser(article.content)}
      </div>

      {/* Categories */}
      {article.categories && article.categories.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2">
          {article.categories.map((cat) => (
            <Link
              key={cat}
              href={`/explore?category=${cat}`}
              className="px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-xs border border-gray-100 hover:bg-gray-100 transition-colors"
            >
              {cat}
            </Link>
          ))}
        </div>
      )}


      {/* RELATED */}
      <div className="py-10">
        <hr className="my-6" />
        <p className="text-xl font-semibold">Related Stories</p>

        {/* <RelatedArticles
          categories={article.categories}
          currentId={article.id}
        /> */}
      </div>
    </div>
  );
}