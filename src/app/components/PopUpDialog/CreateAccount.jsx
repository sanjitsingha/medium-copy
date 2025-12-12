import { EnvelopeIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import React, { useState } from "react";
import RegisterUserWithEmail from "./RegisterUser/RegisterUserWithEmail";
const CreateAccount = ({ onBack }) => {
  const [RegisterFormActive, setRegisterFormActive] = useState(false);
  console.log(RegisterFormActive);
  return (
    <>
      {!RegisterFormActive ? (
        <div className="w-full">
          <h1 className="text-[26px] text-center mt-4">Join Medium</h1>
          <div className=" flex flex-col justify-center items-center">
            <Link
              className="flex border w-[280px] mt-4 border-black rounded-full py-2 pl-4 pr-16 items-center gap-8"
              href="/"
            >
              <EnvelopeIcon className="size-5" />
              <p className="text-[16px]">Sign up with X</p>
            </Link>
            <button
              onClick={() => {
                setRegisterFormActive(true);
              }}
              className="flex border w-[280px] mt-4 border-black rounded-full py-2 pl-4 pr-16 items-center gap-8"
            >
              <EnvelopeIcon className="size-5" />
              <p className="text-[16px]">Sign up with email</p>
            </button>
          </div>
          <p className="text-[14px] mt-12  text-center">
            Already have an account?{" "}
            <button className="underline" onClick={onBack}>
              Sign in
            </button>
          </p>
          <div className="w-full flex items-center justify-center">
            <p className="text-[11px] text-center mt-6  text-gray-500 max-w-[280px]">
              By clicking "Sign in", you accept Medium's Terms of Service and
              Privacy Policy.
            </p>
          </div>
        </div>
      ) : (
        <RegisterUserWithEmail
          onBack={() => {
            setRegisterFormActive(true);
          }}
        />
      )}
    </>
  );
};

export default CreateAccount;
