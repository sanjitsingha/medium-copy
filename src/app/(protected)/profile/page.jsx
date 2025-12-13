"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { XCircleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import Modal from "@/app/components/ui/Modal";
import { account } from "@/lib/appwrite";

const Page = () => {
  const { user, loading, setUser } = useAuthContext();

  // collapsible bio (kept if you still need it)
  const [BioExpand, setBioExpand] = useState(false);
  const contentRef = useRef(null);
  const [height, setHeight] = useState("0px");

  // modal states
  const [usernameModalOpen, setUsernameModalOpen] = useState(false);
  const [bioModalOpen, setBioModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [displayNameModal, setDisplayNameModal] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  // form states
  const [newUsername, setNewUsername] = useState("");
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameMsg, setUsernameMsg] = useState(null);

  const [displayName, setDisplayName] = useState("");
  const [displayLoading, setDisplayLoading] = useState(false);
  const [displayMsg, setDisplayMsg] = useState(null);

  const [bioText, setBioText] = useState("");
  const [bioLoading, setBioLoading] = useState(false);
  const [bioMsg, setBioMsg] = useState(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState(null);

  // fill inputs when modal opens from existing user
  useEffect(() => {
    if (user) {
      setDisplayName(user.name || "");
      setBioText((user.prefs && user.prefs.bio) || "");
      setNewUsername((user.prefs && user.prefs.username) || "");
    }
  }, [user]);

  // animate expand/collapse by auto-calculating content height
  useEffect(() => {
    if (BioExpand) {
      setHeight(contentRef.current?.scrollHeight + "px" || "0px");
    } else {
      setHeight("0px");
    }
  }, [BioExpand]);

  // UTILS: refresh user from Appwrite and update AuthContext
  async function refreshUser() {
    try {
      const updated = await account.get();
      setUser(updated);
    } catch (err) {
      console.error("refreshUser error", err);
    }
  }

  // ------------------ Handlers ------------------

  // Update Display Name
  const handleUpdateDisplayName = async () => {
    setDisplayLoading(true);
    setDisplayMsg(null);

    try {
      await account.updateName(displayName); // Appwrite method for name
      await refreshUser();
      setDisplayMsg({ type: "success", text: "Display name updated." });
      setTimeout(() => {
        setDisplayNameModal(false);
        setDisplayMsg(null);
      }, 900);
    } catch (err) {
      console.error(err);
      setDisplayMsg({ type: "error", text: err.message || "Update failed" });
    } finally {
      setDisplayLoading(false);
    }
  };

  // Update Username (stored in prefs)
  const handleUpdateUsername = async () => {
    setUsernameLoading(true);
    setUsernameMsg(null);

    try {
      // Update prefs (merge new object)
      await account.updatePrefs({
        ...(user.prefs || {}),
        username: newUsername,
      });
      await refreshUser();
      setUsernameMsg({ type: "success", text: "Username updated." });
      setTimeout(() => {
        setUsernameModalOpen(false);
        setUsernameMsg(null);
      }, 900);
    } catch (err) {
      console.error(err);
      setUsernameMsg({ type: "error", text: err.message || "Update failed" });
    } finally {
      setUsernameLoading(false);
    }
  };

  // Update Bio
  const handleUpdateBio = async () => {
    setBioLoading(true);
    setBioMsg(null);

    try {
      await account.updatePrefs({ ...(user.prefs || {}), bio: bioText });
      await refreshUser();
      setBioMsg({ type: "success", text: "Bio updated." });
      setTimeout(() => {
        setBioModalOpen(false);
        setBioMsg(null);
      }, 900);
    } catch (err) {
      console.error(err);
      setBioMsg({ type: "error", text: err.message || "Update failed" });
    } finally {
      setBioLoading(false);
    }
  };

  // Update Password (tries common SDK signatures)
  const handleChangePassword = async () => {
    setPassLoading(true);
    setPassMsg(null);

    try {
      let done = false;
      // Try positional signature: updatePassword(newPassword, oldPassword)
      try {
        // some SDKs expect (password, oldPassword)
        // call and await
        // eslint-disable-next-line no-underscore-dangle
        await account.updatePassword(newPassword, oldPassword);
        done = true;
      } catch (err1) {
        console.warn("positional updatePassword failed", err1?.message || err1);
      }

      if (!done) {
        // Try object signature: updatePassword({ password, oldPassword })
        try {
          await account.updatePassword({ password: newPassword, oldPassword });
          done = true;
        } catch (err2) {
          console.warn("object updatePassword failed", err2?.message || err2);
        }
      }

      if (!done) {
        // Try alternate object key names if SDK expects them
        try {
          await account.updatePassword({ newPassword, oldPassword });
          done = true;
        } catch (err3) {
          console.warn(
            "alternate updatePassword failed",
            err3?.message || err3
          );
        }
      }

      if (!done)
        throw new Error(
          "Unable to update password with current SDK. Check SDK docs/version."
        );

      // success
      setPassMsg({ type: "success", text: "Password updated." });
      setOldPassword("");
      setNewPassword("");
      setTimeout(() => {
        setChangePasswordOpen(false);
        setPassMsg(null);
      }, 900);
    } catch (err) {
      console.error(err);
      setPassMsg({
        type: "error",
        text:
          err.message ||
          "Failed to update password. Ensure old password is correct and new password meets policy.",
      });
    } finally {
      setPassLoading(false);
    }
  };

  // ------------------ UI ------------------
  if (!user) return null; // or show loading/redirect as you prefer

  return (
    <div className="w-full">
      <div className="w-full max-w-[800px] pt-10 mx-auto ">
        <div className="flex justify-between items-baseline">
          <h1 className="text-[26px] font-medium tracking-tighter">Profile</h1>
          <div className="bg-gray-300 w-12 h-12 rounded-full"></div>
        </div>

        <hr className="mb-4 mt-2 opacity-20" />
        <div className="w-full flex flex-col gap-4">
          <div className="flex items-center text-[14px] justify-between text-black/60">
            <p>Display Name</p>
            <button
              onClick={() => setDisplayNameModal(true)}
              className="underline"
            >
              {user.name || "—"}
            </button>
          </div>

          <div className="flex items-center text-[14px] justify-between text-black/60">
            <p>User Name</p>
            <button
              onClick={() => setUsernameModalOpen(true)}
              className="underline"
            >
              {user.prefs?.username || "—"}
            </button>
          </div>

          <div className="flex items-center text-[14px] justify-between text-black/60">
            <p>Email Address</p>
            <p>{user.email || "—"}</p>
          </div>

          <div
            onClick={() => setChangePasswordOpen(true)}
            className="flex cursor-pointer items-center text-[14px] justify-between text-black/60"
          >
            <p>Change Password</p>
            <p className="cursor-pointer underline">Update</p>
          </div>

          <div className="flex items-center text-[14px] justify-between text-black/60">
            <p>About</p>
            <button onClick={() => setBioModalOpen(true)} className="underline">
              Update
            </button>
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

      {/* ---------- Display Name Modal ---------- */}
      <Modal open={displayNameModal} onOpenChange={setDisplayNameModal}>
        <h2 className="text-[16px] mb-4">Display Name</h2>

        <input
          placeholder="New Display Name"
          className="outline-none px-2 w-full bg-gray-200 text-[14px] py-2 rounded"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />

        {displayMsg && (
          <p
            className={`mt-2 text-sm ${
              displayMsg.type === "error" ? "text-red-500" : "text-green-600"
            }`}
          >
            {displayMsg.text}
          </p>
        )}

        <div className="flex gap-2 mt-4 justify-end">
          <button
            onClick={() => setDisplayNameModal(false)}
            className="px-4 py-1 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateDisplayName}
            disabled={displayLoading}
            className="px-4 py-1 bg-black text-white rounded"
          >
            {displayLoading ? "Saving..." : "Confirm"}
          </button>
        </div>
      </Modal>

      {/* ---------- Username Modal ---------- */}
      <Modal open={usernameModalOpen} onOpenChange={setUsernameModalOpen}>
        <h2 className="text-[16px] mb-4">Change Username</h2>

        <input
          type="text"
          placeholder="@newusername"
          className="bg-gray-200 outline-none p-2 w-full rounded-md"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
        />

        {usernameMsg && (
          <p
            className={`mt-2 text-sm ${
              usernameMsg.type === "error" ? "text-red-500" : "text-green-600"
            }`}
          >
            {usernameMsg.text}
          </p>
        )}

        <div className="flex gap-2 mt-4 justify-end">
          <button
            onClick={() => setUsernameModalOpen(false)}
            className="px-4 py-1 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateUsername}
            disabled={usernameLoading}
            className="px-4 py-1 bg-black text-white rounded"
          >
            {usernameLoading ? "Saving..." : "Update"}
          </button>
        </div>
      </Modal>

      {/* ---------- Bio Modal ---------- */}
      <Modal open={bioModalOpen} onOpenChange={setBioModalOpen}>
        <h2 className="text-[16px] mb-4">Update Bio</h2>

        <textarea
          placeholder="Write your bio..."
          className="outline-none p-2 text-[14px] w-full rounded-md bg-gray-100"
          value={bioText}
          onChange={(e) => setBioText(e.target.value)}
          rows={6}
        />

        {bioMsg && (
          <p
            className={`mt-2 text-sm ${
              bioMsg.type === "error" ? "text-red-500" : "text-green-600"
            }`}
          >
            {bioMsg.text}
          </p>
        )}

        <div className="flex gap-2 mt-4 justify-end">
          <button
            onClick={() => setBioModalOpen(false)}
            className="px-4 py-1 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateBio}
            disabled={bioLoading}
            className="px-4 py-1 bg-black text-white rounded"
          >
            {bioLoading ? "Saving..." : "Confirm"}
          </button>
        </div>
      </Modal>

      {/* ---------- Change Password Modal ---------- */}
      <Modal open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <h2 className="text-[16px] mb-4">Change Password</h2>

        <input
          placeholder="Current Password"
          className="outline-none px-2 w-full bg-gray-200 text-[12px] py-2 rounded mb-2"
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />

        <input
          placeholder="New Password"
          className="outline-none px-2 w-full bg-gray-200 text-[12px] py-2 rounded"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        {passMsg && (
          <p
            className={`mt-2 text-sm ${
              passMsg.type === "error" ? "text-red-500" : "text-green-600"
            }`}
          >
            {passMsg.text}
          </p>
        )}

        <div className="flex gap-2 mt-4 justify-end">
          <button
            onClick={() => setChangePasswordOpen(false)}
            className="px-4 py-1 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleChangePassword}
            disabled={passLoading}
            className="px-4 py-1 bg-black text-white rounded"
          >
            {passLoading ? "Saving..." : "Change"}
          </button>
        </div>
      </Modal>

      {/* ---------- Delete Account modal (keeps as demo; implement server-side deletion carefully) ---------- */}
      <Modal open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <h2 className="text-[16px] mb-4">Delete Account</h2>
        <p className="text-[14px] text-black/60">
          This will permanently delete your account and all associated content.
        </p>
        <div className="flex gap-2 mt-4 justify-end">
          <button
            onClick={() => setDeleteModalOpen(false)}
            className="px-4 py-1 rounded"
          >
            Cancel
          </button>
          <button
            className="px-4 py-1 bg-red-700 text-white rounded"
            onClick={() => {
              // implement deletion carefully — server-side is recommended.
              alert("Implement account deletion on server or using Admin SDK.");
            }}
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Page;
