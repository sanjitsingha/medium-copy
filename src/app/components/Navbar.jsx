"use client";

import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import SignIn from "./PopUpDialog/SignIn";
import { useAuthContext } from "@/context/AuthContext";
import { logoutUser } from "@/lib/logout";
import { useRouter } from "next/navigation";
import { MdArrowOutward } from "react-icons/md";
import {
  LockOpenIcon,
  PencilSquareIcon,
  BellAlertIcon,
} from "@heroicons/react/24/outline";
import { CiSearch } from "react-icons/ci";
import { storage } from "@/lib/appwrite";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [showSearchBox, setShowSearchBox] = useState(false);
  const searchRef = useRef(null);

  const { user, loading, setUser } = useAuthContext();
  const router = useRouter();

  const getAvatarUrl = () => {
    if (!user?.prefs?.avatar) return "/default-avatar.png";

    return storage.getFileView("article-images", user.prefs.avatar);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchBox(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setDropdownOpen(false);
    router.refresh();
  };

  return (
    <div className="w-full border-b border-gray-300 h-[70px]">
      <div className="md:px-10 px-4 lg:px-10 xl:px-10  h-full flex justify-between items-center">
        {/* LOGO */}
        <div className="flex items-center gap-4">
          <Link href={"/"} className="text-xl font-semibold">
            openthoughts
          </Link>

          {!loading && user && (
            <div ref={searchRef} className="relative">
              <span className="flex items-center ">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onFocus={() => setShowSearchBox(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchValue.trim()) {
                      router.push(`/search?q=${searchValue}`);
                      setShowSearchBox(false);
                    }
                  }}
                  className="outline-none text-sm w-[300px] bg-gray-100 py-2 px-3 rounded-full"
                  placeholder="Search topics"
                />
                <CiSearch className="ml-[-40px]" size={22} />
              </span>

              {showSearchBox && (
                <div className="absolute top-12 left-0 w-[260px] bg-white shadow-md border border-gray-200 rounded-md">
                  <Link
                    href="/explore"
                    onClick={() => setShowSearchBox(false)}
                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-100"
                  >
                    <p>Explore</p>
                    <MdArrowOutward size={18} />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SIGN IN POPUP */}
        <SignIn open={open} onClose={() => setOpen(false)} />

        <div className="flex items-center gap-6">
          {/* ================== LOADING STATE (SHIMMER) ================== */}
          {loading && (
            <>
              <div className="w-[90px] h-[36px] rounded-full shimmer"></div>
              <div className="w-10 h-10 rounded-full shimmer"></div>
            </>
          )}

          {/* ================== LOGGED OUT VIEW ================== */}
          {!loading && !user && (
            <Link
              href={"/signin"}
              className="text-[14px] bg-black text-white px-8 py-2 rounded-full"
            >
              Sign in
            </Link>
          )}

          {/* ================== LOGGED IN VIEW ================== */}
          {!loading && user && (
            <>
              <Link
                className="text-[14px] flex items-center mr-4 gap-2"
                href="/write"
              >
                <PencilSquareIcon className="size-6 text-black/60 " />
                <p className="text-black/70">Write</p>
              </Link>

              <button className="mr-4 cursor-pointer">
                <BellAlertIcon className="size-6 text-black/60" />
              </button>

              {/* Avatar */}
              <div className="relative">
                <Link  href={"/profile"} className="w-8 h-8 cursor-pointer ">
               
                 
                
                  <img
                    src={getAvatarUrl()}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
               </Link>

              
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
