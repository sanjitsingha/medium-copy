"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const Page = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/profile`,
      });

      if (error) throw error;

      setMessage("Password reset email sent.");
      setEmail("");
    } catch (error) {
      setMessage(error.message || "Failed to send password reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-[800px] w-full mx-auto pt-20 px-4">
        <div>
          <h1 className="text-3xl font-creato tracking-tight text-black">
            Forgot Password
          </h1>
          <p className="text-sm mt-2 text-black/60">
            No worries. Enter your email below and we will help you regain
            access to your account.
          </p>
        </div>
        <form className="py-6 flex flex-col" onSubmit={handleSubmit}>
          <div className="w-full">
            <label
              className="block text-xs font-medium mt-4 text-gray-700"
              htmlFor="email"
            >
              Registered Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              className="text-black font-semibold w-3/5 placeholder:text-gray-500 placeholder:font-medium border-b border-gray-300 focus:border-b-black outline-none py-1"
              type="email"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-black px-8 text-sm cursor-pointer py-3 text-white font-medium mt-6 w-fit rounded-full disabled:opacity-60"
          >
            {loading ? "Sending..." : "Submit a request"}
          </button>
          {message && <p className="text-sm text-black/70 mt-4">{message}</p>}
          <p className="text-sm text-black/60 mt-8">
            Need urgent help? Contact support at{" "}
            <span className="text-black font-semibold underline">
              write.vichento@gmail.com
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Page;
