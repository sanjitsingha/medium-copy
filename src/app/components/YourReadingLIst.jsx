import React from "react";
import { IoBookmarkOutline } from "react-icons/io5";

const YourReadingLIst = () => {
  return (
    <div className="w-full pl-4">
        <p>Your Reading List</p>
      <p className="text-[12px] mt-3 text-gray-500">
        Click the {" "}
        <span className="inline-block">
          <IoBookmarkOutline size={20} /> 
        </span>
          {" "} on any story to easily add it to your reading list
      </p>
    </div>
  );
};

export default YourReadingLIst;
