"use client";
import { useRef, useState } from "react";
import JoditEditor from "jodit-react";
import HTMLReactParser from "html-react-parser";
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

  console.log(user);

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
      const imageUrl = storage.getFileView(
        "article-images", // BUCKET ID
        uploadedFile.$id
      ).toString();

      setFeaturedImage(uploadedFile.$id);
      setFeaturedImageUrl(imageUrl);
      console.log("Uploaded image URL:", imageUrl);
    } catch (error) {
      console.error("Image upload error:", error);
      alert("Failed to upload image");
    }
  };

  const saveDraft = async () => {
    if (!user) {
      alert("Please login to save draft");
      return;
    }

    if (!title && !content) {
      alert("Nothing to save");
      return;
    }

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

  return (
    <div className="w-full max-w-[800px] mx-auto pt-10">
      <div className="w-full rounded-sm mb-6 bg-gray-100 flex justify-center items-center h-60 border border-gray-300 relative overflow-hidden">
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

      <div className="mt-10 flex justify-end gap-3">
        <button onClick={saveDraft} className="border px-4 py-2 rounded-full">
          Save Draft
        </button>
        <button className="bg-black text-white px-4 py-2 rounded-full">
          Publish
        </button>
      </div>
    </div>
  );
}
