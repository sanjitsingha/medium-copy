"use client";

import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin");
    }
  }, [loading, user]);

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <div className="shimmer w-40 h-6 rounded-md" />
      </div>
    );
  }

  if (!user) return null; // Prevent flash before redirect

  return <>{children}</>;
}
