"use client";
import { useRef, useState } from "react";
import JoditEditor from "jodit-react";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { databases, ID, storage } from "@/lib/appwrite";
import { useAuthContext } from "@/context/AuthContext";

export default function WritePage() {
  const { user } = useAuthContext();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const editor = useRef(null);

  const [featuredImage, setFeaturedImage] = useState(null);
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");
  const fileInputRef = useRef(null);

  const handleFeaturedImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    try {
      // Upload image to Appwrite
      const uploadedFile = await storage.createFile(
        "article-images", // BUCKET ID
        ID.unique(),
        file
      );

      // Get preview URL
      const imageUrl = storage
        .getFileView(
          "article-images", // BUCKET ID
          uploadedFile.$id
        )
        .toString();

      setFeaturedImage(uploadedFile.$id);
      setFeaturedImageUrl(imageUrl);
      console.log("Uploaded image URL:", imageUrl);
    } catch (error) {
      console.error("Image upload error:", error);
      alert("Failed to upload image");
    }
  };

  const saveDraft = async () => {
    try {
      await databases.createDocument(
        "693d3d220017a846a1c0", // DATABASE ID
        "drafts", // TABLE ID
        ID.unique(),
        {
          title: title || "Untitled draft",
          content,
          authorId: user.$id,
          featuredImage: featuredImage || "",
          lastEditedAt: new Date().toISOString(),
        }
      );

      alert("Draft saved successfully");
    } catch (error) {
      console.error("Save draft error:", error);
      alert(error.message || "Failed to save draft");
    }
  };

  const publishArticle = async () => {
    // Implement publish logic here
    try {
      await databases.createDocument(
        "693d3d220017a846a1c0", // DATABASE ID
        "articles", // TABLE ID
        ID.unique(),
        {
          title: title || "Untitled article",
          featuredImage: featuredImage || "",
          content,
          authorId: user.$id,
          authorName: user.name || "Anonymous",
          slug: title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, ""),
          status: "published",
          views: 0,
          likes: 0,
        }
      );
      alert("Article published successfully");
    } catch (error) {
      console.error("Publish article error:", error);
      alert(error.message || "Failed to publish article");
    }
  };

  return (
    <div className="w-full max-w-[800px] mx-auto pt-10">
      <div className="w-full flex justify-between items-center mb-4">
        <button onClick={saveDraft} className="text-[14px] cursor-pointer  ">
          Save Draft
        </button>
        <button
          onClick={publishArticle}
          className="bg-green-600 py-2 cursor-pointer rounded-full text-white px-6"
        >
          Published
        </button>
      </div>
      <div className="w-full rounded-sm mb-6 bg-gray-100 flex justify-center items-center h-80 border border-gray-300 relative overflow-hidden">
        {!featuredImageUrl ? (
          <>
            <button onClick={() => fileInputRef.current.click()}>
              <PlusCircleIcon className="w-12 h-12 text-gray-500 cursor-pointer" />
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFeaturedImageUpload}
            />
          </>
        ) : (
          <>
            <img
              src={featuredImageUrl}
              alt="Featured"
              className="w-full h-full object-cover"
            />

            {/* Edit / Replace */}
            <button
              onClick={() => fileInputRef.current.click()}
              className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-3 py-1 rounded-full"
            >
              Edit
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFeaturedImageUpload}
            />
          </>
        )}
      </div>

      <input
        type="text"
        placeholder="Title"
        className="w-full text-[32px] font-serif outline-none my-6"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <JoditEditor
        ref={editor}
        value={content}
        onChange={(newContent) => setContent(newContent)}
      />
    </div>
  );
}
