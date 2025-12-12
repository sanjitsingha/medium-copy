"use client";
import Link from "next/link";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import GoogleSignInButton from "../components/GoogleSignInButton";

export default function SignUpOptions() {
  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center px-6">
      <h1 className="text-3xl mb-10">Join Medium.</h1>

      <GoogleSignInButton />
      <Link
        href="/signup/email"
        className="border w-[280px] py-2 mt-3 rounded-full text-center flex items-center justify-center gap-2"
      >
        <EnvelopeIcon className="size-5" />
        Sign up with email
      </Link>

      <p className="text-sm mt-6">
        Already have an account?{" "}
        <Link href="/signin" className="underline">
          Sign in
        </Link>
      </p>
      <p className="text-[12px]  text-black/60 mt-6">
        By clicking "Sign up", you accept Medium's Terms of Service and Privacy
        Policy.
      </p>
    </div>
  );
}
