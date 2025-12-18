import Link from 'next/link'
import React from 'react'
import { IoBulbOutline } from 'react-icons/io5'

const TrendingStories = () => {
  return (
    <div className='w-full'>
        <p className='font-semibold'>Trending Stories</p>
        <div href="#" className='block mt-4 border-b border-gray-300 pb-4'>
        <div className='w-full flex items-center gap-2'>
            {/* author name and picture  */}
           <div className='w-8 h-8 bg-gray-300 rounded-full'></div>
           <p className='text-[14px] text-gray-500'>Alex Charis Paul</p>
        </div> 
        <Link href="#" className='block mt-2 text-[16px] tracking-tighter font-medium '>
          This is a sample trending story title that is quite interesting, and catchy to read.
          <span className='flex mt-4 gap-1 text-green-600 items-center'>
            <IoBulbOutline size={16}/>
            <p className='text-[12px]'>263</p>
          </span>
        </Link>

        </div>
    </div>
  )
}

export default TrendingStories