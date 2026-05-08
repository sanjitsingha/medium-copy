import Image from "next/image";
import Link from "next/link";
import HTMLReactParser from "html-react-parser";
import { sanitizeHtml } from "@/lib/sanitizeHtml";

const StoriesCard = ({ post }) => {
  const imageUrl = post.cover_image || "/blog_image.avif";
  const avatarUrl = post.users?.avatar || "/default-avatar.jpg";
  const authorName = post.users?.name || post.author_name || "Author";
  const createdAt = post.created_at || post.updated_at;

  return (
    <Link href={`/read/${post.slug}`}>
      <div className="w-full md:w-[380px]">
        <Image
          src={imageUrl}
          width={380}
          height={200}
          className="w-full h-[160px] md:h-[200px] object-cover rounded-sm"
          alt={post.title}
        />

        <div className="py-2">
          <p className="text-xl font-creato font-regular tracking-tight">
            {post.title}
          </p>

          <p className="text-xs mt-2 text-black/40 line-clamp-2">
            {HTMLReactParser(sanitizeHtml(post.content || ""))}
          </p>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-300 relative">
            <Image src={avatarUrl} fill alt="" className="object-cover" />
          </div>
          <span className="text-[12px] text-gray-500">
            {authorName} | {createdAt ? new Date(createdAt).toDateString() : ""}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default StoriesCard;
