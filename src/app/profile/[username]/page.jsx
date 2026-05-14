"use client";
import React, { useEffect, useRef, useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";
import Modal from "@/app/components/ui/Modal";
import { useRouter, useParams } from "next/navigation";
import { PencilIcon } from "@heroicons/react/24/outline";
import { supabase } from "@/lib/supabaseClient";
import { logout } from "../../../../services/authService";
import Image from "next/image";
import Sidebar from "@/app/components/Sidebar";

const Page = () => {
  const router = useRouter();
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const { user, loading } = useAuthContext();
  const fileInputRef = useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);



  console.log(profileLoading)

  const INTERESTS = [
    "Technology", "AI", "Startups", "Business", "Programming",
    "Design", "Productivity", "Finance", "Marketing", "Health",
    "Career", "Sports", "Science", "Writing",
  ];

  // ── Fetch profile from Supabase users table ──
  useEffect(() => {
    const fetchProfile = async () => {
      setProfileLoading(true);

      let query = supabase.from("users").select("*");

      // Check if the parameter is a valid UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      if (uuidRegex.test(username)) {
        query = query.or(`username.eq.${username},id.eq.${username}`);
      } else {
        query = query.eq("username", username);
      }

      const { data, error } = await query.single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
      }

      setProfile(data);
      setProfileLoading(false);
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

  // ── Re-fetch profile after any update ──
  const refreshUser = async () => {
    if (!profile?.id) return;
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", profile.id)
      .single();
    if (data) setProfile(data);
  };

  // ── Preferences ──
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [prefLoading, setPrefLoading] = useState(false);
  const [prefMsg, setPrefMsg] = useState(null);

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) => {
      if (prev.includes(interest)) return prev.filter((i) => i !== interest);
      if (prev.length >= 5) return prev;
      return [...prev, interest];
    });
  };

  // ── Modal states ──
  const [usernameModalOpen, setUsernameModalOpen] = useState(false);
  const [bioModalOpen, setBioModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [displayNameModal, setDisplayNameModal] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  // ── Form states ──
  const [newUsername, setNewUsername] = useState("");
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameMsg, setUsernameMsg] = useState(null);

  const [displayName, setDisplayName] = useState("");
  const [displayLoading, setDisplayLoading] = useState(false);
  const [displayMsg, setDisplayMsg] = useState(null);

  const [bioText, setBioText] = useState("");
  const [bioLoading, setBioLoading] = useState(false);
  const [bioMsg, setBioMsg] = useState(null);

  const [newPassword, setNewPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState(null);




  // ── Populate form inputs when profile loads ──
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.name || "");
      setBioText(profile.bio || "");
      setNewUsername(profile.username || "");
      setSelectedInterests(Array.isArray(profile.interests) ? profile.interests : []);
    }
  }, [profile]);

  // ── Logout ──
  const handleLogout = async () => {
    try {
      await logout();
    } catch (_) { }
    router.push("/");
  };

  // ── Update Display Name ──
  const handleUpdateDisplayName = async () => {
    setDisplayLoading(true);
    setDisplayMsg(null);
    try {
      const { error } = await supabase
        .from("users")
        .update({ name: displayName })
        .eq("id", user.id);
      if (error) throw error;
      await refreshUser();
      setDisplayMsg({ type: "success", text: "Display name updated." });
      setTimeout(() => { setDisplayNameModal(false); setDisplayMsg(null); }, 900);
    } catch (err) {
      setDisplayMsg({ type: "error", text: err.message || "Update failed" });
    } finally {
      setDisplayLoading(false);
    }
  };

  // ── Update Username ──
  const handleUpdateUsername = async () => {
    setUsernameLoading(true);
    setUsernameMsg(null);
    try {
      const { error } = await supabase
        .from("users")
        .update({ username: newUsername })
        .eq("id", user.id);
      if (error) throw error;
      await refreshUser();
      setUsernameMsg({ type: "success", text: "Username updated." });
      setTimeout(() => { setUsernameModalOpen(false); setUsernameMsg(null); }, 900);
    } catch (err) {
      setUsernameMsg({ type: "error", text: err.message || "Update failed" });
    } finally {
      setUsernameLoading(false);
    }
  };

  // ── Update Bio ──
  const handleUpdateBio = async () => {
    if (!user) return;
    setBioLoading(true);
    setBioMsg(null);
    try {
      const { data, error } = await supabase
        .from("users")
        .update({ bio: bioText })
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setProfile(data);
        setBioMsg({ type: "success", text: "Bio updated." });
        setTimeout(() => { 
          setBioModalOpen(false); 
          setBioMsg(null); 
        }, 900);
      }
    } catch (err) {
      console.error("Error updating bio:", err);
      setBioMsg({ type: "error", text: err.message || "Update failed" });
    } finally {
      setBioLoading(false);
    }
  };

  // ── Update Preferences ──
  const handleUpdatePreferences = async () => {
    if (selectedInterests.length < 3) {
      setPrefMsg({ type: "error", text: "Please select at least 3 interests" });
      return;
    }
    try {
      setPrefLoading(true);
      setPrefMsg(null);
      const { error } = await supabase
        .from("users")
        .update({ interests: selectedInterests })
        .eq("id", user.id);
      if (error) throw error;
      await refreshUser();
      setPrefMsg({ type: "success", text: "Preferences updated successfully" });
      setTimeout(() => { setPreferencesOpen(false); setPrefMsg(null); }, 900);
    } catch (err) {
      setPrefMsg({ type: "error", text: err.message || "Failed to update preferences" });
    } finally {
      setPrefLoading(false);
    }
  };

  // ── Change Password (Supabase only needs new password) ──
  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setPassMsg({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    setPassLoading(true);
    setPassMsg(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPassMsg({ type: "success", text: "Password updated." });
      setNewPassword("");
      setTimeout(() => { setChangePasswordOpen(false); setPassMsg(null); }, 900);
    } catch (err) {
      setPassMsg({ type: "error", text: err.message || "Failed to update password." });
    } finally {
      setPassLoading(false);
    }
  };

  // ── Avatar Upload ──
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("Max image size is 2MB"); return; }

    try {
      setAvatarUploading(true);
      const fileExt = file.name.split(".").pop();
      const filePath = `avatars/${user.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("article-images")
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("article-images")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("users")
        .update({ avatar: publicUrl })
        .eq("id", user.id);
      if (updateError) throw updateError;

      await refreshUser();
      setAvatarModalOpen(false);
    } catch (err) {
      console.error("Avatar upload failed", err);
      alert("Failed to upload avatar");
    } finally {
      setAvatarUploading(false);
    }
  };


  // ── UI ──
  if (loading || profileLoading) return (
    <div className="flex h-screen w-full items-center justify-center bg-white">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-gray-200"></div>
        <div className="h-4 w-32 rounded bg-gray-200"></div>
      </div>
    </div>
  );

  if (!profile) return (
    <div className="flex h-screen w-full items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Profile not found</h1>
        <p className="text-gray-500 mt-2">The user you are looking for does not exist.</p>
      </div>
    </div>
  );

  const isOwnProfile = user && user.id === profile.id;

  if (!isOwnProfile) {
    return (
      <div className="flex">
        {user && <Sidebar />}
        <div className="flex-1 w-full bg-white min-h-screen pb-20">
          <div className="w-full max-w-3xl px-4 md:px-6 pt-16 mx-auto font-creato">

            <div className="w-full flex items-center gap-8">
              <Image
                src={profile.avatar || "/default-avatar.jpg"}
                alt="Profile"
                width={120}
                height={120}
                className="w-[120px] h-[120px] rounded-full object-cover bg-gray-100 mb-6"
              />
              <div>
                <h1 className="text-3xl font-semibold text-black ">{profile.name || profile.username || "Anonymous"}</h1>
                {profile.username && <p className="text-gray-500 ">@{profile.username}</p>}
              </div>
            </div>

            {profile.bio && <p className="text-gray-700 text-[15px] mb-6 max-w-lg mx-auto">{profile.bio}</p>}

            <div className="flex justify-center gap-6 mt-4 border-t pt-6 w-full">
              <div className="flex flex-col items-center">
                <span className="font-semibold text-xl">{profile.posts_count || 0}</span>
                <span className="text-sm text-gray-500">Posts</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 w-full bg-white min-h-screen pb-20">
        <div className="w-full max-w-3xl px-4 md:px-6 pt-16 mx-auto font-creato">
          <h1 className="text-4xl font-semibold tracking-tight text-black mb-12">Settings</h1>

          <div className="space-y-10">
            {/* Profile Information Section */}
            <section>
              <div className="flex items-center justify-between py-6 border-b border-gray-200">
                <div className="space-y-1">
                  <h2 className="text-[15px] font-medium text-black">Profile picture</h2>
                  <p className="text-sm text-gray-500">Your profile picture will appear on your profile page.</p>
                </div>
                <div className="relative cursor-pointer group ml-4 shrink-0" onClick={() => setAvatarModalOpen(true)}>
                  <Image
                    src={profile?.avatar || "/default-avatar.jpg"}
                    alt="Profile"
                    width={88}
                    height={88}
                    className="w-[88px] h-[88px] rounded-full object-cover group-hover:opacity-80 transition-opacity bg-gray-100"
                  />
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <PencilIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between py-6 border-b border-gray-200 cursor-pointer group" onClick={() => {
                setDisplayName(profile?.name || "");
                setDisplayNameModal(true);
              }}>
                <div className="space-y-1 flex-1 pr-4">
                  <h2 className="text-[15px] font-medium text-black">Name</h2>
                  <p className="text-sm text-gray-500 line-clamp-1">{profile?.name || "—"}</p>
                </div>
                <p className="text-sm text-gray-400 group-hover:text-black transition-colors">Edit</p>
              </div>

              <div className="flex items-center justify-between py-6 border-b border-gray-200 cursor-pointer group" onClick={() => {
                setNewUsername(profile?.username || "");
                setUsernameModalOpen(true);
              }}>
                <div className="space-y-1 flex-1 pr-4">
                  <h2 className="text-[15px] font-medium text-black">Username</h2>
                  <p className="text-sm text-gray-500 line-clamp-1">{profile?.username || "Add a username"}</p>
                </div>
                <p className="text-sm text-gray-400 group-hover:text-black transition-colors">Edit</p>
              </div>

              <div className="flex items-center justify-between py-6 border-b border-gray-200 cursor-pointer group" onClick={() => {
                setBioText(profile?.bio || "");
                setBioModalOpen(true);
              }}>
                <div className="space-y-1 flex-1 pr-4">
                  <h2 className="text-[15px] font-medium text-black">Short bio</h2>
                  <p className="text-sm text-gray-500 line-clamp-2">{profile?.bio || "Add a short bio"}</p>
                </div>
                <p className="text-sm text-gray-400 group-hover:text-black transition-colors">Edit</p>
              </div>

              <div className="flex items-center justify-between py-6 border-b border-gray-200">
                <div className="space-y-1 flex-1 pr-4">
                  <h2 className="text-[15px] font-medium text-black">Email address</h2>
                  <p className="text-sm text-gray-500">{profile?.email || user?.email || "—"}</p>
                </div>
              </div>
            </section>

            {/* Account Management Section */}
            <section className="pt-4">
              <h3 className="text-xs font-semibold text-gray-400 mb-2 tracking-widest uppercase">Account</h3>

              <div className="flex items-center justify-between py-6 border-b border-gray-200 cursor-pointer group" onClick={() => setChangePasswordOpen(true)}>
                <div className="space-y-1 flex-1 pr-4">
                  <h2 className="text-[15px] font-medium text-black">Password</h2>
                  <p className="text-sm text-gray-500">Update your account password</p>
                </div>
                <p className="text-sm text-gray-400 group-hover:text-black transition-colors">Edit</p>
              </div>

              <div className="flex items-center justify-between py-6 border-b border-gray-200 cursor-pointer group" onClick={() => {
                setSelectedInterests(Array.isArray(profile?.interests) ? profile.interests : []);
                setPreferencesOpen(true);
              }}>
                <div className="space-y-1 flex-1 pr-4">
                  <h2 className="text-[15px] font-medium text-black">Topics of Interest</h2>
                  <p className="text-sm text-gray-500">Manage your reading preferences</p>
                </div>
                <p className="text-sm text-gray-400 group-hover:text-black transition-colors">Edit</p>
              </div>
            </section>

            <section className="pt-4">
              <h3 className="text-xs font-semibold text-red-500 mb-2 tracking-widest uppercase">Danger Zone</h3>

              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center justify-between py-6 cursor-pointer group"
              >
                <div className="space-y-1">
                  <h2 className="text-[15px] font-medium text-red-600">Sign out</h2>
                  <p className="text-sm text-gray-500">Sign out of your account on this device</p>
                </div>
                <ArrowRightStartOnRectangleIcon className="w-5 h-5 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </section>
          </div>

          <div className="mt-16 pt-8 flex justify-center">
            <p className="text-sm text-gray-400 font-serif italic">
              Made with <span className="text-red-500 mx-1 not-italic text-lg leading-none align-middle">&hearts;</span> in India
            </p>
          </div>
        </div>

        {/* ── Display Name Modal ── */}
        <Modal open={displayNameModal} onOpenChange={setDisplayNameModal}>
          <div className="p-2">
            <h2 className="text-xl font-semibold text-black mb-6">Display Name</h2>
            <input
              placeholder="New Display Name"
              className="outline-none w-full border-b border-gray-200 focus:border-black text-black text-[15px] py-2 transition-colors placeholder:text-gray-400"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoFocus
            />
            {displayMsg && (
              <p className={`mt-3 text-sm ${displayMsg.type === "error" ? "text-red-500" : "text-green-600"}`}>
                {displayMsg.text}
              </p>
            )}
            <div className="flex gap-3 mt-8 justify-end">
              <button onClick={() => setDisplayNameModal(false)} className="px-5 py-2 text-[14px] text-gray-500 hover:text-black font-medium transition-colors">Cancel</button>
              <button onClick={handleUpdateDisplayName} disabled={displayLoading} className="px-5 py-2 text-[14px] bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">
                {displayLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </Modal>

        {/* ── Username Modal ── */}
        <Modal open={usernameModalOpen} onOpenChange={setUsernameModalOpen}>
          <div className="p-2">
            <h2 className="text-xl font-semibold text-black mb-6">Change Username</h2>
            <input
              type="text"
              placeholder="@newusername"
              className="outline-none w-full border-b border-gray-200 focus:border-black text-black text-[15px] py-2 transition-colors placeholder:text-gray-400"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              autoFocus
            />
            {usernameMsg && (
              <p className={`mt-3 text-sm ${usernameMsg.type === "error" ? "text-red-500" : "text-green-600"}`}>
                {usernameMsg.text}
              </p>
            )}
            <div className="flex gap-3 mt-8 justify-end">
              <button onClick={() => setUsernameModalOpen(false)} className="px-5 py-2 text-[14px] text-gray-500 hover:text-black font-medium transition-colors">Cancel</button>
              <button onClick={handleUpdateUsername} disabled={usernameLoading} className="px-5 py-2 text-[14px] bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">
                {usernameLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </Modal>

        {/* ── Bio Modal ── */}
        <Modal open={bioModalOpen} onOpenChange={setBioModalOpen}>
          <div className="p-2">
            <h2 className="text-xl font-semibold text-black mb-6">Short bio</h2>
            <textarea
              placeholder="Write your bio..."
              className="outline-none p-3 text-[15px] w-full text-black rounded-xl bg-gray-50 border border-gray-200 focus:border-gray-400 focus:bg-white transition-all resize-none"
              value={bioText}
              onChange={(e) => setBioText(e.target.value)}
              rows={5}
              autoFocus
            />
            {bioMsg && (
              <p className={`mt-3 text-sm ${bioMsg.type === "error" ? "text-red-500" : "text-green-600"}`}>
                {bioMsg.text}
              </p>
            )}
            <div className="flex gap-3 mt-8 justify-end">
              <button onClick={() => setBioModalOpen(false)} className="px-5 py-2 text-[14px] text-gray-500 hover:text-black font-medium transition-colors">Cancel</button>
              <button onClick={handleUpdateBio} disabled={bioLoading} className="px-5 py-2 text-[14px] bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">
                {bioLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </Modal>

        {/* ── Preferences Modal ── */}
        <Modal open={preferencesOpen} onOpenChange={setPreferencesOpen}>
          <div className="p-2">
            <h2 className="text-xl font-semibold text-black mb-2">Topics of Interest</h2>
            <p className="text-[15px] text-gray-500 mb-6">Choose at least 3 topics you&apos;re interested in reading about.</p>
            <div className="flex flex-wrap gap-2.5 mb-6">
              {INTERESTS.map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-2 rounded-full text-[14px] border transition-colors ${isSelected ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"}`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
            <p className="text-sm text-gray-400 mb-2">{selectedInterests.length} / 5 selected</p>
            {prefMsg && (
              <p className={`mt-3 text-sm ${prefMsg.type === "error" ? "text-red-500" : "text-green-600"}`}>
                {prefMsg.text}
              </p>
            )}
            <div className="flex gap-3 mt-8 justify-end">
              <button onClick={() => setPreferencesOpen(false)} className="px-5 py-2 text-[14px] text-gray-500 hover:text-black font-medium transition-colors">Cancel</button>
              <button onClick={handleUpdatePreferences} disabled={prefLoading} className="px-5 py-2 text-[14px] bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">
                {prefLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </Modal>

        {/* ── Change Password Modal ── */}
        <Modal open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
          <div className="p-2">
            <h2 className="text-xl font-semibold text-black mb-6">Change Password</h2>
            <input
              placeholder="New Password (min 6 characters)"
              className="outline-none w-full border-b border-gray-200 focus:border-black text-black text-[15px] py-2 transition-colors placeholder:text-gray-400"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoFocus
            />
            {passMsg && (
              <p className={`mt-3 text-sm ${passMsg.type === "error" ? "text-red-500" : "text-green-600"}`}>
                {passMsg.text}
              </p>
            )}
            <div className="flex gap-3 mt-8 justify-end">
              <button onClick={() => setChangePasswordOpen(false)} className="px-5 py-2 text-[14px] text-gray-500 hover:text-black font-medium transition-colors">Cancel</button>
              <button onClick={handleChangePassword} disabled={passLoading} className="px-5 py-2 text-[14px] bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">
                {passLoading ? "Saving..." : "Change"}
              </button>
            </div>
          </div>
        </Modal>

        {/* ── Delete Account Modal ── */}
        <Modal open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
          <div className="p-2">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Delete Account</h2>
            <p className="text-[15px] text-gray-600 mb-8">
              This will permanently delete your account and all associated content. This action cannot be undone.
            </p>
            <div className="flex gap-3 mt-4 justify-end">
              <button onClick={() => setDeleteModalOpen(false)} className="px-5 py-2 text-[14px] text-gray-500 hover:text-black font-medium transition-colors">Cancel</button>
              <button
                className="px-5 py-2 text-[14px] bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-colors"
                onClick={() => alert("Implement account deletion on server or using Admin SDK.")}
              >
                Delete Account
              </button>
            </div>
          </div>
        </Modal>

        {/* ── Avatar Modal ── */}
        <Modal open={avatarModalOpen} onOpenChange={setAvatarModalOpen}>
          <div className="p-2 text-center">
            <h2 className="text-xl font-semibold text-black mb-2">Profile picture</h2>
            <p className="text-[15px] text-gray-500 mb-8">Choose an image for your profile.</p>

            <button
              onClick={() => { if (!avatarUploading) fileInputRef.current.click(); }}
              disabled={avatarUploading}
              className="w-full bg-black hover:bg-gray-800 transition-colors text-white py-3 rounded-full font-medium disabled:opacity-50"
            >
              {avatarUploading ? "Uploading..." : "Select an image"}
            </button>

            <button
              onClick={() => setAvatarModalOpen(false)}
              className="mt-4 text-[14px] text-gray-500 hover:text-black font-medium transition-colors"
            >
              Cancel
            </button>

            <input
              type="file"
              accept="image/*"
              hidden
              ref={fileInputRef}
              onChange={handleAvatarChange}
            />
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Page;
