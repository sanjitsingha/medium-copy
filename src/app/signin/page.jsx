"use client";
import Link from "next/link";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import GoogleSignInButton from "../components/GoogleSignInButton";

export default function SignInPage() {
  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center px-6">
      <h1 className="text-3xl mb-10">welcome back.</h1>

      <GoogleSignInButton />

      {/* Email */}
      <Link
        href="/signin/email"
        className="border mt-3 w-[280px] py-2 rounded-full text-center flex items-center justify-center gap-2"
      >
        <EnvelopeIcon className="size-5" />
        Sign in with email
      </Link>

      <p className="text-sm mt-6">
        No account?{" "}
        <Link href="/signup" className="underline">
          Create one
        </Link>
      </p>

      <p className="text-[12px]  text-black/60 mt-6">
        By clicking "Sign in", you accept Medium's Terms of Service and Privacy
        Policy.
      </p>
    </div>
  );
}
