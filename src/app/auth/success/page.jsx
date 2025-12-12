// app/auth/success/page.js   (or app/auth/success/client.jsx if using app router)
"use client";

import { useEffect, useState } from "react";
import { account } from "@/lib/appwrite";
import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function OAuthSuccess() {
  const { setUser } = useAuthContext();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        // Fetch current user — Appwrite should have created the session cookie
        const user = await account.get();
        setUser(user);
        // Redirect where you want (home or dashboard)
        router.push("/");
      } catch (err) {
        setError("OAuth login failed. Try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Signing you in…</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  return null;
}
