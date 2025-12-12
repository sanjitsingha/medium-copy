"use client";
import React, { useEffect, useRef, useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import Modal from "@/app/components/ui/Modal";
const page = () => {
  const [user, setuser] = useState(true);
  const { loading } = useAuthContext();
  const [BioExpand, setBioExpand] = useState(false);
  const contentRef = useRef(null);
  const [height, setHeight] = useState("0px");
  const [usernameModalOpen, setUsernameModalOpen] = useState(false);
  const [bioModalOpen, setBioModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // animate expand/collapse by auto-calculating content height
  useEffect(() => {
    if (BioExpand) {
      setHeight(contentRef.current.scrollHeight + "px");
    } else {
      setHeight("0px");
    }
  }, [BioExpand]);

  return (
    <>
      {user && (
        <div className="w-full">
          <div className="max-w-[800px] py-10 mx-auto">
            <div className="flex justify-between items-baseline">
              <h1 className="text-[26px] font-medium tracking-tighter">
                Profile
              </h1>
              <div className="bg-gray-300 w-12 h-12 rounded-full"></div>
            </div>
            <hr className="mb-4 mt-2 opacity-20" />
            <div className="w-full flex flex-col gap-4">
              <div className="flex items-center text-[14px] justify-between text-black/60">
                <p>Display Name</p>
                <p>Sanjit Singha</p>
              </div>
              <div className="flex items-center text-[14px] justify-between text-black/60">
                <p>User Name</p>
                <button onClick={() => setUsernameModalOpen(true)}>
                  @anonymous
                </button>
              </div>
              <div className="flex items-center text-[14px] justify-between text-black/60">
                <p>Email Address</p>
                <p>itsmesanjitsingh@gmail.com</p>
              </div>
              <div className="bio ">
                <div className="flex items-center text-[14px] justify-between text-black/60">
                  <p>About me</p>
                  <button
                    onClick={() => setBioExpand(!BioExpand)}
                    className="flex items-center gap-1 cursor-pointer"
                  >
                    <p>Click here to edit</p>
                    <ChevronUpDownIcon className="w-4 h-4" />
                  </button>
                </div>
                <div
                  style={{ height }}
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                >
                  <div ref={contentRef} className="pt-2 pb-8">
                    <form action="">
                      <textarea
                        placeholder="Hii, My name is Alex"
                        maxLength={400}
                        className="bg-gray-200 rounded-sm text-black placeholder:text-black/20 p-2 text-sm min-h-[100px] outline-none w-full block"
                        name=""
                        id=""
                      ></textarea>
                      <button className="text-[13px] text-right px-10 mt-2 py-2 bg-black text-white rounded-full cursor-pointer">
                        Update
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setDeleteModalOpen(true)}
                className="w-full cursor-pointer text-left "
              >
                <p className="text-red-500 text-[14px]">Delete Account</p>
                <p className="text-[12px] text-black/60">
                  Permanently delete your account and all of your content.
                </p>
              </button>
            </div>
          </div>
          <Modal open={usernameModalOpen} onOpenChange={setUsernameModalOpen}>
            <h2 className="text-xl font-semibold mb-4">Change Username</h2>
            <input
              type="text"
              placeholder="@newusername"
              className="bg-gray-200 p-2 w-full rounded-md"
            />
            <button
              onClick={() => setUsernameModalOpen(false)}
              className="mt-5 px-6 py-2 bg-black text-white rounded-full"
            >
              Update
            </button>
          </Modal>
          <Modal open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
            <h2 className="text-[16px] mb-4">Delete Account</h2>
            <p className="text-[14px] text-black/60">
              We’re sorry to see you go. Once your account is deleted, all of
              your content will be permanently gone, including your profile,
              stories, publications, notes, and responses.
              <br />
              Deleting your Medium account will not delete any Stripe account you have connected to
              your Medium account. If you’re not sure about that, we suggest you
              deactivate or submit a request at help.medium.com instead. If you
              created a Medium Membership through the Apple App Store or Google
              Play Store, you must also cancel your subscription via iTunes or
              Google Play Store.
            </p>
            <button
              onClick={() => setUsernameModalOpen(false)}
              className="mt-5 px-6 py-2 bg-red-800 text-white rounded-full"
            >
              Confirm
            </button>
          </Modal>
        </div>
      )}
    </>
  );
};

export default page;
