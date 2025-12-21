"use client";

import { useEffect, useState } from "react";
import { databases, ID } from "@/lib/appwrite";
import { Query } from "appwrite";

const DB_ID = "693d3d220017a846a1c0";
const LIKES_COLLECTION = "article_likes";
const BOOKMARKS_COLLECTION = "article_bookmarks";

export default function useArticleActions(userId) {
    const [likes, setLikes] = useState(new Set());
    const [bookmarks, setBookmarks] = useState(new Set());
    const [version, setVersion] = useState(0);

    /* Fetch user likes & bookmarks */
    useEffect(() => {
        if (!userId) return;

        const fetchActions = async () => {
            const [likesRes, bookmarksRes] = await Promise.all([
                databases.listDocuments(DB_ID, LIKES_COLLECTION, [
                    Query.equal("userId", [userId]),
                ]),
                databases.listDocuments(DB_ID, BOOKMARKS_COLLECTION, [
                    Query.equal("userId", [userId]),
                ]),
            ]);

            setLikes(new Set(likesRes.documents.map((l) => l.articleId)));
            setBookmarks(new Set(bookmarksRes.documents.map((b) => b.articleId)));
        };

        fetchActions();
    }, [userId]);

    /* Like toggle */
    const toggleLike = async (articleId) => {
        if (!userId) return alert("Login to like");

        if (likes.has(articleId)) {
            const res = await databases.listDocuments(
                DB_ID,
                LIKES_COLLECTION,
                [
                    Query.equal("articleId", [articleId]),
                    Query.equal("userId", [userId]),
                ]
            );

            await databases.deleteDocument(
                DB_ID,
                LIKES_COLLECTION,
                res.documents[0].$id
            );

            setLikes((prev) => {
                const s = new Set(prev);
                s.delete(articleId);
                return s;
            });
        } else {
            await databases.createDocument(DB_ID, LIKES_COLLECTION, ID.unique(), {
                articleId,
                userId,
            });

            setLikes((prev) => new Set(prev).add(articleId));
        }
    };

    /* Bookmark toggle */
    const toggleBookmark = async (articleId) => {
        if (!userId) return alert("Login to bookmark");

        if (bookmarks.has(articleId)) {
            const res = await databases.listDocuments(
                DB_ID,
                BOOKMARKS_COLLECTION,
                [
                    Query.equal("articleId", [articleId]),
                    Query.equal("userId", [userId]),
                ]
            );

            await databases.deleteDocument(
                DB_ID,
                BOOKMARKS_COLLECTION,
                res.documents[0].$id
            );

            setBookmarks((prev) => {
                const s = new Set(prev);
                s.delete(articleId);

                return s;
            });
            setVersion((v) => v + 1);
        } else {
            await databases.createDocument(DB_ID, BOOKMARKS_COLLECTION, ID.unique(), {
                articleId,
                userId,
            });

            setBookmarks((prev) => new Set(prev).add(articleId));
            setVersion(v => v + 1);
        }
    };

    return {
        likes,
        bookmarks,
        toggleLike,
        toggleBookmark,
        version,
    };
}
