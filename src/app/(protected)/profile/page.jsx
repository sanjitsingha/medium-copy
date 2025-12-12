"use client";
import React, { useState } from "react";
import { useAuthContext } from "@/context/AuthContext";

const page = () => {
  const { loading } = useAuthContext();

  const [user, setuser] = useState(true);

  return (
    <>
      {user && (
        <div className="w-full">
          <div className="max-w-[800px] py-10 mx-auto">
            <h1 className="text-[26px] font-medium tracking-tighter">
              Profile
            </h1>
            <hr className="my-4 opacity-20" />
            <div className="w-full flex flex-col gap-4">
              <div className="flex items-center text-[14px] justify-between text-black/60">
                <p>Display Name</p>
                <p>Sanjit Singha</p>
              </div>
              <div className="flex items-center text-[14px] justify-between text-black/60">
                <p>User Name</p>
                <p>@anonymous</p>
              </div>
              <div className="flex items-center text-[14px] justify-between text-black/60">
                <p>Email Address</p>
                <p>itsmesanjitsingh@gmail.com</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default page;
