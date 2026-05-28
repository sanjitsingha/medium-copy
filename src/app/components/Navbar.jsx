"use client";

import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { logoutUser } from "@/lib/logout";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

import { MdArrowOutward } from "react-icons/md";
import { CiSearch } from "react-icons/ci";
import { HiMenuAlt2, HiX } from "react-icons/hi";
import {
  PencilSquareIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon,
  UserIcon,
  BookOpenIcon,
  ChartBarIcon,
  QueueListIcon,
} from "@heroicons/react/24/outline";

const Navbar = () => {
  const { user, loading, setUser } = useAuthContext();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: authData } = await supabase.auth.getUser();

      if (!authData?.user) return;

      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      setProfile(data);
    };

    fetchProfile();
  }, []);

  // console.log("USER PROFILE:", profile)

  // const handleLogout = async () => {
  //   await logoutUser();
  //   setUser(null);
  //   setSidebarOpen(false);
  //   router.refresh();
  // };

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <div className="w-full border-b border-gray-300 h-[64px] sticky top-0 z-50  bg-white">
        <div className="px-4 md:px-10 h-full flex justify-between items-center">
          {/* LEFT */}
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            {!loading && user && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden"
              >
                <HiMenuAlt2 size={26} />
              </button>
            )}

            <Link href="/" className="text-xl text-secondary font-semibold">
              <Image
                src="/vichento_logo_black.png"
                alt="logo"
                width={100}
                height={100}
              />
            </Link>

            {/* Desktop search */}
            {!loading && user && (
              <div className="hidden md:flex items-center relative ml-4">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchValue.trim()) {
                      router.push(`/search?q=${searchValue}`);
                      setSearchValue("");
                    }
                  }}
                  placeholder="Search topics"
                  className="outline-none text-sm w-[260px] text-black bg-gray-200 py-2 px-3 rounded-full"
                />
                <CiSearch
                  className="absolute right-3"
                  color="black"
                  size={18}
                />
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-5">
            {/* Mobile search icon */}
            {!loading && user && (
              <button
                className="md:hidden"
                onClick={() => router.push("/search")}
              >
                <CiSearch size={22} />
              </button>
            )}

            {!loading && !user && (
              <Link
                href="/signin"
                className="text-sm bg-black text-white px-6 py-2 rounded-full"
              >
                Sign in
              </Link>
            )}

            {!loading && user && (
              <>
                <Link
                  href="/write"
                  className="hidden md:flex items-center gap-2 border-r pr-6 border-gray-300 text-sm"
                >
                  <PencilSquareIcon className="size-5 text-black/60" />
                  <span className="text-black/70">Write</span>
                </Link>

                <Link
                  href={"/report-bug"}
                  className="hidden md:flex items-center  gap-2  border-r pr-6 border-gray-300  rounded  text-sm"
                >
                  <ExclamationTriangleIcon className="size-5 text-yellow-700" />
                  <p className="font-creato text-yellow-700">Report Bug</p>
                </Link>

                <Link href="/profile">
                  <Image
                    src={profile?.avatar || "/default-avatar.png"}
                    width={32}
                    height={32}
                    className="w-8 h-8 p-[2px]    rounded-full object-cover"
                    alt="avatar"
                  />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ================= MOBILE SIDEBAR ================= */}
      <>
        {/* Overlay */}
        <div
          onClick={() => setSidebarOpen(false)}
          className={`fixed inset-0 bg-black/40 z-40 touch-none transition-opacity duration-300 ${
            sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        />

        {/* Drawer */}
        <div
          className={`fixed top-0 left-0 h-full w-[350px] bg-white z-50 p-5 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex justify-between items-center mb-12">
            <Link href="/" className="text-xl text-secondary font-semibold">
              <Image
                src="/vichento_logo_black.png"
                alt="logo"
                width={100}
                height={100}
              />
            </Link>
            <button
              className="bg-gray-200 p-2 rounded-full"
              onClick={() => setSidebarOpen(false)}
            >
              <HiX size={24} />
            </button>
          </div>

          <nav className="flex flex-col gap-6 text-lg">
            <Link
              className="flex gap-2 text-gray-700 text-lg items-center"
              href="/"
              onClick={() => setSidebarOpen(false)}
            >
              <HomeIcon className="size-6" /> Home
            </Link>

            <Link
              className="flex gap-2 items-center text-gray-700 text-lg"
              href="/library"
              onClick={() => setSidebarOpen(false)}
            >
              <BookOpenIcon className="size-6" />
              Library
            </Link>

            <Link
              className="text-gray-700 flex gap-2 items-center text-lg"
              href="/profile"
              onClick={() => setSidebarOpen(false)}
            >
              <UserIcon className="size-6" />
              Profile
            </Link>

            <Link
              className="text-gray-700 flex gap-2 items-center text-lg"
              href="/stories"
              onClick={() => setSidebarOpen(false)}
            >
              <QueueListIcon className="size-6" />
              Stories
            </Link>

            <Link
              className="text-gray-700 flex gap-2 items-center text-lg"
              href="/stats"
              onClick={() => setSidebarOpen(false)}
            >
              <ChartBarIcon className="size-6" />
              Stats
            </Link>

            {/* <button
                onClick={handleLogout}
                className="text-left text-red-600 mt-6"
              >
                Logout
              </button> */}
          </nav>
        </div>
      </>
    </>
  );
};

export default Navbar;
