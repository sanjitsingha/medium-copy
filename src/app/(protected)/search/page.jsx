'use client'
import React, { useState } from 'react'
import { useSearchParams } from 'next/navigation';

const page = () => {
    const searchParams = useSearchParams()
    const [activeTab, setActiveTab] = useState("stories");

    const query = searchParams.get("q");

    return (
        <div className='w-full'>
            <div className='max-w-[800px] mx-auto'>
                <div className='w-full mt-6'>
                     <p className="text-[32px] font-serif font-semibold">
            Search results for{" "}
            <span className="italic text-gray-600">
              {query ? `"${query}"` : ""}
            </span>
          </p>
                </div>
                <div className="mt-4 border-b border-gray-200 mb-10 flex gap-10">
                    <button
                        onClick={() => setActiveTab("stories")}
                        className={`pb-2 text-[14px] ${activeTab === "stories"
                            ? "text-black border-b-2 border-black"
                            : "text-gray-500"
                            }`}
                    >
                        Stories
                    </button>


                </div>
            </div>
        </div>
    )
}

export default page