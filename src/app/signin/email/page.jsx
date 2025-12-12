"use client";

import { useState } from "react";
import Link from "next/link";
import { account } from "@/lib/appwrite";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function EmailLogin() {
  const router = useRouter();
  const { setUser } = useAuthContext();

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const session = await account.createEmailPasswordSession({
        email,
        password: pass,
      });

      setUser(session.user);
      router.push("/");
    } catch (error) {
      setErrorMsg("Invalid email or password");
    }

    setLoading(false);
  };

  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center px-6">
      <h1 className="text-2xl mb-6">Sign in with email</h1>

      <form
        className="w-full max-w-[300px] flex flex-col"
        onSubmit={handleLogin}
      >
        {/* EMAIL INPUT */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-gray-200 text-[14px] focus:border outline-none rounded-sm px-3 py-2 mb-3"
          required
        />

        {/* PASSWORD INPUT WITH EYE ICON */}
        <div className="relative w-full">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className="bg-gray-200 text-[14px] focus:border outline-none rounded-sm px-3 py-2 w-full pr-10"
            required
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600"
          >
            {showPassword ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* ERROR MESSAGE */}
        {errorMsg && (
          <p className="text-red-500 text-sm mb-3 text-center">{errorMsg}</p>
        )}

        {/* SUBMIT BUTTON */}
        <button
          disabled={loading}
          className="bg-black text-white rounded-full py-2 mt-4 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <Link href="/signin" className="mt-6 underline text-sm">
        Go back
      </Link>
    </div>
  );
}
