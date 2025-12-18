import Link from "next/link";
import React from "react";
import { IoBookmarkOutline } from "react-icons/io5";

const YourReadingLIst = () => {
  return (
    <div className="w-full">
        <p className="font-semibold">Your Reading List</p>
      <p className="text-[12px] hidden mt-3 text-gray-500">
        Click the {" "}
        <span className="inline-block">
          <IoBookmarkOutline size={20} /> 
        </span>
          {" "} on any story to easily add it to your reading list
      </p>
      <div className="w-full">
        <div className="pt-4 border-b border-gray-300 pb-4">
          <div className="flex items-center gap-2">
            {/* top sec */}
            <div className="w-6 h-6 rounded-full bg-gray-300">
              {/* profile image */}
            </div>
            <p className="text-sm text-gray-500">Author Name</p>
          </div>
          <Link href={"/"}  className=" cursor-pointer">
            <p className="font-medium leading-[18px] mt-2 text-[14px] tracking-tight">What the Smartest People I Know Are Quietly Learning.</p>
            <p className="text-gray-500 text-[12px] mt-2">16 Nov</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default YourReadingLIst;
