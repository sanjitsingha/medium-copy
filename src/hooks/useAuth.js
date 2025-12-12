"use client";

import { useEffect, useState } from "react";
import { account } from "@/lib/appwrite";

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      try {
        const response = await account.get();
        setUser(response);
      } catch (err) {
        setUser(null);
      }
      setLoading(false);
    }

    getUser();
  }, []);

  return { user, loading, setUser };
}
