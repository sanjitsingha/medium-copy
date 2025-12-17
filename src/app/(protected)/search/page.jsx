"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Query } from "appwrite";
import Link from "next/link";
import Image from "next/image";
import { databases, storage } from "@/lib/appwrite";
import { IoBookmarkOutline, IoBulbOutline } from "react-icons/io5";
import { IoIosShareAlt } from "react-icons/io";

const page = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const [activeTab, setActiveTab] = useState("stories");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;

    const fetchSearchResults = async () => {
      setLoading(true);

      try {
        const response = await databases.listDocuments(
          "693d3d220017a846a1c0", // DATABASE ID
          "articles", // COLLECTION ID
          [
            Query.equal("status", ["published"]),
            Query.orderDesc("$updatedAt"),
            Query.limit(50), // fetch more, then filter
          ]
        );

        // CLIENT SIDE FILTER
        const filtered = response.documents.filter((article) => {
          const title = article.title?.toLowerCase() || "";
          return title.includes(query);
        });

        setArticles(filtered);
      } catch (error) {
        console.error("Search fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  return (
    <div className="w-full">
      <div className="max-w-[800px] mx-auto">
        <div className="w-full mt-6">
          <p className="text-[32px] tracking-tight font-semibold">
            Search results for{" "}
            <span className=" text-gray-600">{query ? `"${query}"` : ""}</span>
          </p>
        </div>
        <div className="mt-4 border-b border-gray-200 mb-10 flex gap-10">
          <button
            onClick={() => setActiveTab("stories")}
            className={`pb-2 text-[14px] ${
              activeTab === "stories"
                ? "text-black border-b-2 border-black"
                : "text-gray-500"
            }`}
          >
            Stories
          </button>
        </div>

        {/* Results */}
        {loading && <p className="text-sm text-gray-500">Searching stories…</p>}

        {!loading && articles.length === 0 && (
          <p className="text-sm text-gray-500">
            No stories found for "{query}"
          </p>
        )}

        {!loading &&
          articles.map((article) => {
            const imageUrl = article.featuredImage
              ? storage
                  .getFileView("article-images", article.featuredImage)
                  .toString()
              : null;

            return (
              <div
                key={article.$id}
                className="border-b border-gray-200 pb-8 mb-8"
              >
                {/* Author */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <p>{article.authorName}</p>
                  <p>{new Date(article.$updatedAt).toDateString()}</p>
                </div>

                {/* Content */}
                <Link href={`/read/${article.slug}`}>
                  <div className="flex gap-4 mt-2 cursor-pointer">
                    <div>
                      <p className="text-[22px] font-semibold leading-tight">
                        {article.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        {article.content.replace(/<[^>]*>/g, "").slice(0, 200)}…
                      </p>
                    </div>

                    {imageUrl && (
                      <div className="min-w-[160px] rounded overflow-hidden">
                        <Image
                          src={imageUrl}
                          alt={article.title}
                          width={160}
                          height={160}
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                </Link>
                   {/* Actions */}
                            <div className="w-full flex gap-10 mt-4 text-gray-500">
                              <button>
                                <IoBulbOutline size={16} />
                              </button>
                              <button>
                                <IoIosShareAlt size={16} />
                              </button>
                              <button>
                                <IoBookmarkOutline size={16} />
                              </button>
                            </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default page;
