"use client";

import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import SignIn from "./PopUpDialog/SignIn";
import { useAuthContext } from "@/context/AuthContext";
import { logoutUser } from "@/lib/logout";
import { useRouter } from "next/navigation";
import { MdArrowOutward } from "react-icons/md";
import { LockOpenIcon, PencilSquareIcon, BellAlertIcon } from "@heroicons/react/24/outline";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [showSearchBox, setShowSearchBox] = useState(false);
  const searchRef = useRef(null);

  const { user, loading, setUser } = useAuthContext();
  const router = useRouter();


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
          <Link href={"/"} className="text-xl font-semibold">Medium</Link>
          <div ref={searchRef} className="relative">
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
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="w-10 h-10 cursor-pointer rounded-full bg-gray-300 flex justify-center items-center text-black font-medium"
                >
                  {user.name
                    ? user.name.charAt(0).toUpperCase()
                    : user.email.charAt(0).toUpperCase()}
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 px-2 py-6 mt-3 w-60 bg-white shadow-md border border-gray-200 rounded-lg animate-fade-in">
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="block "
                    >
                      <div className="flex gap-2 items-center">
                        <div>
                          <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                        </div>
                        <div>
                          <p className="text-[14px]">{user.name}</p>
                          <p className="text-[12px] text-green-500">
                            View Profile
                          </p>
                        </div>
                      </div>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full mt-4 flex items-center gap-2 cursor-pointer text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                    >
                      <LockOpenIcon className="w-5 h-5 inline-block mr-2" />
                      <p>Logout</p>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
