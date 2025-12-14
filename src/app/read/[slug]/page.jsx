"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { databases, storage } from "@/lib/appwrite";
import { Query } from "appwrite";
import HTMLReactParser from "html-react-parser";
import Link from "next/link";
import { GoBookmark } from "react-icons/go";
import { GoBookmarkFill } from "react-icons/go";
import { IoBulbOutline } from "react-icons/io5";
import { IoIosShareAlt } from "react-icons/io";

export default function ReadArticlePage() {
  const { slug } = useParams();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

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
      }
    };

    fetchArticle();
  }, [slug]);

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
    <div className="max-w-[800px] mx-auto pt-10">
      <h1 className="text-[42px] font-serif leading-tight">{article.title}</h1>
      <div className="w-full flex border-l-6 pl-4 border-green-600 my-8 justify-between">
        <div className="text-gray-500 text-sm flex gap-4 items-center">
          <p>{article.authorName || "Admin"}</p>
          <p>{new Date(article.$createdAt).toDateString()}</p>
          <p>{article.readTime + "min Read"}</p>
        </div>
        <div>
          <button className="cursor-pointer">
            <GoBookmark size={22} />
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
      <div className=" mt-10 w-full  justify-end flex gap-3 h-full">
        <button className="bg-gray-300 h-8 w-8 rounded-full flex items-center justify-center cursor-pointer">
          <IoBulbOutline size={18} />
        </button>
        <button className="bg-gray-300 h-8 w-8 rounded-full flex items-center justify-center cursor-pointer">
          <IoIosShareAlt size={18} />
        </button>
      </div>
      <div className="w-full border-l-6 pl-4 border-green-600  my-20">
        <p className="text-gray-500 text-sm">The Author:</p>
        <p className="text-[26px] font-serif mt-2">Sanjit Singha</p>
        <p className="text-sm w-[70%] text-gray-500">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto,
          modi numquam. Veniam beatae excepturi ut pariatur eveniet, similique
          culpa delectus!
        </p>
      </div>
    </div>
  );
}
