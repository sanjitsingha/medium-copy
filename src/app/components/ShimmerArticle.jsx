import React from "react";

const ShimmerArticle = () => {
  return (
    <div className="border-b border-gray-100 pb-8 mb-8 animate-pulse">
      {/* Author */}
      <div className="flex items-center gap-4 mb-3">
        <div className="h-3 w-24 bg-gray-200 rounded"></div>
        <div className="h-3 w-20 bg-gray-100 rounded"></div>
      </div>

      {/* Content */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="h-6 w-3/4 bg-gray-200 rounded mb-3"></div>
          <div className="h-4 w-full bg-gray-100 rounded mb-2"></div>
          <div className="h-4 w-5/6 bg-gray-100 rounded"></div>
        </div>

        {/* Image placeholder */}
        <div className="w-[180px] h-[120px] bg-gray-300 rounded"></div>
      </div>

      {/* Actions */}
      <div className="flex gap-10 mt-4">
        <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
        <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
        <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  );
};

export default ShimmerArticle;
