"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

export default function OAuthSuccess() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !data.session) {
        setError("OAuth login failed. Try again.");
        return;
      }

      router.push("/");
    }, 1200);

    return () => clearTimeout(timer);
  }, [router]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-white">
      <div className="animate-pulse">
        <Image src="/logo.png" alt="Logo" width={80} height={80} priority />
      </div>
    </div>
  );
}
