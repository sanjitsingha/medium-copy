import React from 'react'
import { IoIosShareAlt } from 'react-icons/io';
import { IoBulbOutline } from "react-icons/io5";

const StoriesCard = () => {
  return (
    <div className='w-[300px] '>
      <img className='w-full h-[200px]' src="/blog_image.avif" alt="alit_image" />
    <div className='flex items-center gap-2 mt-2'>
      <div className='w-6 h-6 rounded-full bg-gray-300'></div>
       <p className='text-[12px] text-gray-500 '>Author Name</p>
    </div>
    <div className='py-2'>
      <p className='text-[22px] mt-1 leading-[26px]  font-semibold'>What is a blog? Definition, types, benefits and why you need one</p>
      <p className='text-[14px] leading-[18px]  mt-4 text-gray-500'>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Veniam mollitia cumque nisi quam reprehenderit neque?</p>
    </div>
    <div className='my-6 flex items-center gap-6'>
      <IoBulbOutline size={18}/>
      <IoIosShareAlt size={18}/>
    </div>
    </div>
  )
}

export default StoriesCard