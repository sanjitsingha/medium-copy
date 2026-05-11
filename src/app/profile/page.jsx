"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

export default function ProfileRedirect() {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/signin");
      } else {
        const fetchUser = async () => {
          const { data } = await supabase
            .from("users")
            .select("username")
            .eq("id", user.id)
            .single();

          if (data?.username) {
            router.replace(`/profile/${data.username}`);
          } else {
            // Fallback to user id if no username is set yet
            router.replace(`/profile/${user.id}`);
          }
        };
        fetchUser();
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-gray-200"></div>
        <div className="h-4 w-32 rounded bg-gray-200"></div>
      </div>
    </div>
  );
}
