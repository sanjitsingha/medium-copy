"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function VerifyPending() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) return;

      setEmail(data.user.email || "");

      if (data.user.email_confirmed_at) {
        router.push("/");
      }
    };

    checkUser();
  }, [router]);

  const handleResend = async () => {
    if (cooldown > 0 || !email) return;

    try {
      setLoading(true);
      setMsg("");

      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      setMsg("Verification email sent again.");
      setCooldown(30);
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error(err);
      setMsg("Failed to resend email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-2xl font-semibold mb-4">Verify your email</h1>

      <p className="text-sm text-black/60 mb-2 max-w-sm">
        We have sent a verification link to:
      </p>

      <p className="text-sm font-medium mb-6">{email || "your email"}</p>

      <p className="text-xs text-black/50 mb-6 max-w-sm">
        Please check your inbox and click the link to continue.
      </p>

      <button
        onClick={handleResend}
        disabled={loading || cooldown > 0 || !email}
        className="bg-black text-white px-6 py-2 rounded-full disabled:opacity-60"
      >
        {loading ? "Sending..." : cooldown > 0 ? `Wait ${cooldown}s` : "Resend Email"}
      </button>

      {msg && <p className="text-sm mt-4 text-green-600">{msg}</p>}

      <p className="text-xs text-black/40 mt-6">
        Did not receive the email? Check your spam folder.
      </p>
    </div>
  );
}
