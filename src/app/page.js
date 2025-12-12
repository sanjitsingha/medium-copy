"use client";

import Navbar from "./components/Navbar";
import { useAuthContext } from "@/context/AuthContext";
import Homepage from "./Pages/Homepage"; // authenticated feed
import LandingPage from "./Pages/LandingPages/LandingPage"; // public landing

export default function Home() {
  const { user, loading } = useAuthContext();

  // show Navbar always, then body below
  // show a simple shimmer while auth state is being determined
  if (loading) {
    return (
      <>
        <div className="w-full h-[calc(100vh-70px)] flex items-center justify-center">
          <div className="w-48 h-6 rounded-md shimmer" />
        </div>
      </>
    );
  }

  // If user is NOT logged in -> show **public** LandingPage
  if (!user) {
    return (
      <>
        <LandingPage />
      </>
    );
  }

  // If user IS logged in -> show authenticated Homepage/feed
  return (
    <>
      <Homepage />
    </>
  );
}
