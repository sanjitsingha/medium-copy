"use client";
import React, { useState } from "react";
import { EnvelopeOpenIcon } from "@heroicons/react/24/outline";

const RegisterUserWithEmail = ({ onBack }) => {
  return (
    <div className="w-full">
      <EnvelopeOpenIcon className="size-6 mx-auto mt-4" />
      <h1 className="text-[26px] text-center mt-4">Sign up with email</h1>

      <div className="py-10 w-full flex flex-col items-center justify-center px-10">
        <form
          className="w-full max-w-[300px] flex flex-col items-center"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="text"
            className="bg-gray-200 rounded-md mt-2 px-4 text-[14px] py-2 w-full outline-none"
            placeholder="Enter your email address"
          />

          <input
            type="password"
            className="bg-gray-200 rounded-md mt-2 px-4 text-[14px] py-2 w-full outline-none"
            placeholder="Type your password"
          />

          {/* CENTERED BUTTON */}
          <button
            type="submit"
            className="bg-black text-white text-sm px-6 py-2 rounded-full mt-6 mx-auto block"
          >
            Create Account
          </button>
        </form>

        {/* BACK BUTTON */}
        <button
          onClick={onBack}
          className="text-[13px] mt-6 underline cursor-pointer"
        >
          Back to sign up options
        </button>
      </div>
    </div>
  );
};

export default RegisterUserWithEmail;
