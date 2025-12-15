import Image from "next/image";
import React, { useEffect, useState } from "react";
import { databases, storage } from "@/lib/appwrite";
import { Query } from "appwrite";
import { IoBulbOutline } from "react-icons/io5";
import { IoIosShareAlt } from "react-icons/io";
import { IoBookmarkOutline } from "react-icons/io5";
import Link from "next/link";
import ShimmerArticle from "../components/ShimmerArticle";

const Homepage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("explore");

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await databases.listDocuments(
          "693d3d220017a846a1c0", // DATABASE ID
          "articles", // COLLECTION ID
          [
            Query.equal("status", ["published"]),
            Query.orderDesc("$updatedAt"),
            Query.limit(10),
          ]
        );

        setArticles(response.documents);
      } catch (error) {
        console.error("Fetch articles error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <div className="w-full">
      <div className="w-full max-w-[800px] pt-4 mx-auto ">
         <div className="mt-6 border-b border-gray-200 mb-10 flex gap-10">
          <button
            onClick={() => setActiveTab("explore")}
            className={`pb-2 text-[14px] ${
              activeTab === "explore"
                ? "text-black border-b-2 border-black"
                : "text-gray-500"
            }`}
          >
            Explore
          </button>

          <button
            onClick={() => setActiveTab("for you")}
            className={`pb-2 text-[14px] ${
              activeTab === "for you"
                ? "text-black border-b-2 border-black"
                : "text-gray-500"
            }`}
          >
            For you
          </button>
        </div>

       {activeTab === "explore" && (
  <>
    {loading &&
      Array.from({ length: 5 }).map((_, index) => (
        <ShimmerArticle key={index} />
      ))}

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
            <div className="w-full flex items-center gap-4">
              <p className="text-[12px]">{article.authorName}</p>
              <p className="text-[12px] text-gray-500">
                {new Date(article.$updatedAt).toDateString()}
              </p>
            </div>

            {/* Content */}
            <Link href={`/read/${article.slug}`}>
              <div className="flex items-center gap-4 cursor-pointer">
                <div>
                  <p className="text-[24px] leading-tight tracking-tighter font-semibold">
                    {article.title}
                  </p>

                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                    {article.content
                      .replace(/<[^>]*>/g, "")
                      .slice(0, 220)}
                    …
                  </p>
                </div>

                {imageUrl && (
                  <div className="rounded-sm overflow-hidden min-w-[180px]">
                    <Image
                      src={imageUrl}
                      alt={article.title}
                      width={180}
                      height={180}
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
  </>
)}

   
      </div>
    </div>
  );
};

export default Homepage;
