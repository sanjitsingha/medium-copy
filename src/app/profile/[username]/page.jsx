"use client";
import React, { useEffect, useRef, useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { ArrowRightStartOnRectangleIcon, PencilIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Modal from "@/app/components/ui/Modal";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { logout } from "../../../../services/authService";
import Image from "next/image";
import Sidebar from "@/app/components/Sidebar";
import Link from "next/link";

const Page = () => {
  const router = useRouter();
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const { user, loading } = useAuthContext();
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [articles, setArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Home"); // "Home" or "About"
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  const INTERESTS = [
    "Technology", "AI", "Startups", "Business", "Programming",
    "Design", "Productivity", "Finance", "Marketing", "Health",
    "Career", "Sports", "Science", "Writing",
  ];

  // ── Modals State ──
  const [displayNameModal, setDisplayNameModal] = useState(false);
  const [usernameModalOpen, setUsernameModalOpen] = useState(false);
  const [bioModalOpen, setBioModalOpen] = useState(false);
  const [socialsModalOpen, setSocialsModalOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);

  // ── Form State ──
  const [displayName, setDisplayName] = useState("");
  const [displayLoading, setDisplayLoading] = useState(false);
  const [displayMsg, setDisplayMsg] = useState(null);

  const [newUsername, setNewUsername] = useState("");
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameMsg, setUsernameMsg] = useState(null);

  const [bioText, setBioText] = useState("");
  const [bioLoading, setBioLoading] = useState(false);
  const [bioMsg, setBioMsg] = useState(null);

  const [socials, setSocials] = useState({ twitter: "", linkedin: "", instagram: "", website: "" });
  const [socialsLoading, setSocialsLoading] = useState(false);
  const [socialsMsg, setSocialsMsg] = useState(null);

  const [selectedInterests, setSelectedInterests] = useState([]);
  const [prefLoading, setPrefLoading] = useState(false);
  const [prefMsg, setPrefMsg] = useState(null);

  const [newPassword, setNewPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState(null);

  const [aboutContent, setAboutContent] = useState("");
  const [aboutLoading, setAboutLoading] = useState(false);
  const [aboutMsg, setAboutMsg] = useState(null);

  // ── Fetch profile ──
  useEffect(() => {
    const fetchProfile = async () => {
      setProfileLoading(true);
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      let query = supabase.from("users").select("*");
      if (uuidRegex.test(username)) {
        query = query.or(`username.eq.${username},id.eq.${username}`);
      } else {
        query = query.eq("username", username);
      }
      const { data, error } = await query.single();
      if (error && error.code !== "PGRST116") console.error("Error fetching profile:", error);
      setProfile(data);
      setProfileLoading(false);
    };
    if (username) fetchProfile();
  }, [username]);

  // ── Fetch articles ──
  useEffect(() => {
    if (profile?.id) {
      const fetchArticles = async () => {
        setArticlesLoading(true);
        const { data, error } = await supabase
          .from("articles")
          .select("*")
          .eq("author_id", profile.id)
          .eq("status", "published")
          .order("created_at", { ascending: false });
        if (!error) setArticles(data || []);
        setArticlesLoading(false);
      };
      fetchArticles();
    }
  }, [profile?.id]);

  // ── Refresh user data ──
  const refreshUser = async () => {
    if (!profile?.id) return;
    const { data } = await supabase.from("users").select("*").eq("id", profile.id).single();
    if (data) setProfile(data);
  };

  // ── Populate form ──
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.name || "");
      setBioText(profile.bio || "");
      setNewUsername(profile.username || "");
      setSelectedInterests(Array.isArray(profile.interests) ? profile.interests : []);
      setSocials({
        twitter: profile.twitter || "",
        linkedin: profile.linkedin || "",
        instagram: profile.instagram || "",
        website: profile.website || ""
      });
      setAboutContent(profile.about_rich || "");
    }
  }, [profile]);

  // ── Handlers ──
  const handleLogout = async () => {
    try { await logout(); } catch (_) { }
    router.push("/");
  };

  const handleUpdateDisplayName = async () => {
    setDisplayLoading(true); setDisplayMsg(null);
    try {
      const { error } = await supabase.from("users").update({ name: displayName }).eq("id", user.id);
      if (error) throw error;
      await refreshUser();
      setDisplayMsg({ type: "success", text: "Name updated." });
      setTimeout(() => { setDisplayNameModal(false); setDisplayMsg(null); }, 900);
    } catch (err) { setDisplayMsg({ type: "error", text: err.message || "Update failed" }); }
    finally { setDisplayLoading(false); }
  };

  const handleUpdateUsername = async () => {
    setUsernameLoading(true); setUsernameMsg(null);
    try {
      const { error } = await supabase.from("users").update({ username: newUsername }).eq("id", user.id);
      if (error) throw error;
      await refreshUser();
      setUsernameMsg({ type: "success", text: "Username updated." });
      if (newUsername !== profile.username) router.replace(`/profile/${newUsername}?settings=true`);
      setTimeout(() => { setUsernameModalOpen(false); setUsernameMsg(null); }, 900);
    } catch (err) { setUsernameMsg({ type: "error", text: err.message || "Update failed" }); }
    finally { setUsernameLoading(false); }
  };

  const handleUpdateBio = async () => {
<<<<<<< HEAD
    setBioLoading(true); setBioMsg(null);
    try {
      const { error } = await supabase.from("users").update({ bio: bioText }).eq("id", user.id);
      if (error) throw error;
      await refreshUser();
      setBioMsg({ type: "success", text: "Bio updated." });
      setTimeout(() => { setBioModalOpen(false); setBioMsg(null); }, 900);
    } catch (err) { setBioMsg({ type: "error", text: err.message || "Update failed" }); }
    finally { setBioLoading(false); }
=======
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
>>>>>>> 9c11ff4b8dcaf60db53ded77597031a67b3328a7
  };

  const handleUpdateSocials = async () => {
    setSocialsLoading(true); setSocialsMsg(null);
    try {
      const { error } = await supabase.from("users").update(socials).eq("id", user.id);
      if (error) throw error;
      await refreshUser();
      setSocialsMsg({ type: "success", text: "Socials updated." });
      setTimeout(() => { setSocialsModalOpen(false); setSocialsMsg(null); }, 900);
    } catch (err) { setSocialsMsg({ type: "error", text: err.message || "Update failed" }); }
    finally { setSocialsLoading(false); }
  };

  const handleUpdatePreferences = async () => {
    if (selectedInterests.length < 3) { setPrefMsg({ type: "error", text: "Please select at least 3 topics." }); return; }
    setPrefLoading(true); setPrefMsg(null);
    try {
      const { error } = await supabase.from("users").update({ interests: selectedInterests }).eq("id", user.id);
      if (error) throw error;
      await refreshUser();
      setPrefMsg({ type: "success", text: "Preferences saved." });
      setTimeout(() => { setPreferencesOpen(false); setPrefMsg(null); }, 900);
    } catch (err) { setPrefMsg({ type: "error", text: err.message || "Update failed" }); }
    finally { setPrefLoading(false); }
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) { setPassMsg({ type: "error", text: "Min 6 characters." }); return; }
    setPassLoading(true); setPassMsg(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPassMsg({ type: "success", text: "Password updated." });
      setTimeout(() => { setChangePasswordOpen(false); setPassMsg(null); setNewPassword(""); }, 900);
    } catch (err) { setPassMsg({ type: "error", text: err.message || "Update failed" }); }
    finally { setPassLoading(false); }
  };

  const handleUpdateAbout = async () => {
    setAboutLoading(true); setAboutMsg(null);
    const content = editorRef.current?.innerHTML || aboutContent;
    try {
      const { error } = await supabase.from("users").update({ about_rich: content }).eq("id", user.id);
      if (error) throw error;
      await refreshUser();
      setAboutMsg({ type: "success", text: "About updated." });
      setTimeout(() => { setAboutModalOpen(false); setAboutMsg(null); }, 900);
    } catch (err) { setAboutMsg({ type: "error", text: err.message || "Update failed" }); }
    finally { setAboutLoading(false); }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const { error: updateError } = await supabase.from('users').update({ avatar: publicUrl }).eq('id', user.id);
      if (updateError) throw updateError;
      await refreshUser();
      setAvatarModalOpen(false);
    } catch (err) { console.error("Avatar upload failed", err); alert("Failed to upload avatar"); }
    finally { setAvatarUploading(false); }
  };

  if (loading || profileLoading) return (
    <div className="flex h-screen w-full items-center justify-center bg-white">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-gray-200"></div>
        <div className="h-4 w-32 rounded bg-gray-200"></div>
      </div>
    </div>
  );

  if (!profile) return (
    <div className="flex h-screen w-full items-center justify-center bg-white text-center p-4">
      <div><h1 className="text-2xl font-bold">Profile not found</h1><p className="text-gray-500 mt-2">This user doesn't exist.</p></div>
    </div>
  );

  const isOwnProfile = user && user.id === profile.id;
  const isSettingsView = isOwnProfile && typeof window !== 'undefined' && window.location.search.includes('settings=true');
  const latestArticle = articles.length > 0 ? articles[0] : null;
  const remainingArticles = articles.length > 1 ? articles.slice(1) : [];

  return (
    <div className="flex min-h-screen bg-white">
      {user && <Sidebar />}

      {isSettingsView ? (
        /* ── Settings View ── */
        <div className="flex-1 w-full bg-white pb-20">
          <div className="w-full max-w-3xl px-4 md:px-6 pt-16 mx-auto font-creato">
            <div className="mb-12">
              <button onClick={() => router.push(`/profile/${profile.username}`)} className="group flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors mb-6">
                <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back to profile
              </button>
              <h1 className="text-4xl font-bold tracking-tight text-black">Settings</h1>
            </div>

            <div className="space-y-10">
              <section className="divide-y divide-gray-100">
                <div className="flex items-center justify-between py-6">
                  <div className="space-y-1"><h2 className="text-[15px] font-medium text-black">Profile picture</h2><p className="text-sm text-gray-500">Appears on your profile page.</p></div>
                  <div className="relative cursor-pointer group shrink-0" onClick={() => setAvatarModalOpen(true)}>
                    <Image src={profile.avatar || "/default-avatar.jpg"} alt="Avatar" width={88} height={88} className="w-[88px] h-[88px] rounded-full object-cover group-hover:opacity-80 transition-opacity bg-gray-100" />
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"><PencilIcon className="w-6 h-6 text-white" /></div>
                  </div>
                </div>
<<<<<<< HEAD
                <div className="flex items-center justify-between py-6 cursor-pointer group" onClick={() => setDisplayNameModal(true)}>
                  <div className="space-y-1 flex-1 pr-4"><h2 className="text-[15px] font-medium text-black">Name</h2><p className="text-sm text-gray-500">{profile.name || "—"}</p></div>
                  <p className="text-sm text-gray-400 group-hover:text-black transition-colors">Edit</p>
                </div>
                <div className="flex items-center justify-between py-6 cursor-pointer group" onClick={() => setUsernameModalOpen(true)}>
                  <div className="space-y-1 flex-1 pr-4"><h2 className="text-[15px] font-medium text-black">Username</h2><p className="text-sm text-gray-500">@{profile.username}</p></div>
                  <p className="text-sm text-gray-400 group-hover:text-black transition-colors">Edit</p>
                </div>
                <div className="flex items-center justify-between py-6 cursor-pointer group" onClick={() => setBioModalOpen(true)}>
                  <div className="space-y-1 flex-1 pr-4"><h2 className="text-[15px] font-medium text-black">Short bio</h2><p className="text-sm text-gray-500 line-clamp-2">{profile.bio || "Add a short bio"}</p></div>
                  <p className="text-sm text-gray-400 group-hover:text-black transition-colors">Edit</p>
=======
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
>>>>>>> 9c11ff4b8dcaf60db53ded77597031a67b3328a7
                </div>
                <div className="flex items-center justify-between py-6 cursor-pointer group" onClick={() => setSocialsModalOpen(true)}>
                  <div className="space-y-2 flex-1 pr-4"><h2 className="text-[15px] font-medium text-black">Social Handles</h2><div className="flex gap-3">{Object.entries(socials).map(([p,v])=>v && <span key={p} className="text-xs text-gray-400 uppercase">{p}</span>)}</div></div>
                  <p className="text-sm text-gray-400 group-hover:text-black transition-colors">Edit</p>
                </div>
              </section>

              <section className="pt-4 divide-y divide-gray-100">
                <h3 className="text-xs font-semibold text-gray-400 mb-2 tracking-widest uppercase">Account</h3>
                <div className="flex items-center justify-between py-6 cursor-pointer group" onClick={() => setChangePasswordOpen(true)}>
                  <div className="space-y-1 flex-1 pr-4"><h2 className="text-[15px] font-medium text-black">Password</h2><p className="text-sm text-gray-500">Update security</p></div>
                  <p className="text-sm text-gray-400 group-hover:text-black transition-colors">Edit</p>
                </div>
<<<<<<< HEAD
                <div className="flex items-center justify-between py-6 cursor-pointer group" onClick={() => setPreferencesOpen(true)}>
                  <div className="space-y-1 flex-1 pr-4"><h2 className="text-[15px] font-medium text-black">Interests</h2><p className="text-sm text-gray-500">Personalize feed</p></div>
                  <p className="text-sm text-gray-400 group-hover:text-black transition-colors">Edit</p>
=======
                <p className="text-sm text-gray-400 group-hover:text-black transition-colors">Edit</p>
              </div>

              <div className="flex items-center justify-between py-6 border-b border-gray-200 cursor-pointer group" onClick={() => {
                setSelectedInterests(Array.isArray(profile?.interests) ? profile.interests : []);
                setPreferencesOpen(true);
              }}>
                <div className="space-y-1 flex-1 pr-4">
                  <h2 className="text-[15px] font-medium text-black">Topics of Interest</h2>
                  <p className="text-sm text-gray-500">Manage your reading preferences</p>
>>>>>>> 9c11ff4b8dcaf60db53ded77597031a67b3328a7
                </div>
                <div className="py-6 flex items-center justify-between"><div className="space-y-1"><h2 className="text-[15px] font-medium text-black">Email</h2><p className="text-sm text-gray-500">{profile.email}</p></div></div>
              </section>

              <section className="pt-4">
                <button onClick={handleLogout} className="w-full flex items-center justify-between py-6 group"><div className="text-left"><h2 className="text-[15px] font-medium text-red-600">Sign out</h2><p className="text-sm text-gray-500">Logout of this session</p></div><ArrowRightStartOnRectangleIcon className="w-5 h-5 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" /></button>
              </section>
            </div>
          </div>
        </div>
      ) : (
        /* ── Profile View ── */
        <div className="flex-1 w-full bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row gap-12">
              <div className="flex-1 max-w-2xl">
                {/* Mobile Header */}
                <div className="flex items-center gap-4 mb-8 md:hidden">
                  <Image src={profile.avatar || "/default-avatar.jpg"} alt="Avatar" width={64} height={64} className="w-16 h-16 rounded-full object-cover bg-gray-100" />
                  <div><h1 className="text-2xl font-bold text-black">{profile.name || profile.username}</h1><p className="text-gray-500 text-sm">@{profile.username}</p></div>
                </div>

                <div className="flex gap-8 border-b border-gray-100 mb-8 overflow-x-auto hide-scrollbar">
                  {["Home", "About"].map(t => (
                    <button key={t} onClick={() => setActiveTab(t)} className={`pb-4 text-sm font-medium relative transition-colors ${activeTab === t ? "text-black" : "text-gray-500 hover:text-black"}`}>{t}{activeTab === t && <div className="absolute bottom-0 left-0 right-0 h-px bg-black" />}</button>
                  ))}
                </div>

                {activeTab === "Home" ? (
                  <div className="space-y-12">
                    {articlesLoading ? <div className="animate-pulse space-y-8"><div className="h-4 w-1/4 bg-gray-100 rounded"></div><div className="h-6 w-3/4 bg-gray-100 rounded"></div></div> : articles.length === 0 ? <div className="py-20 text-center text-gray-500">No stories published yet.</div> : (
                      <>
                        {latestArticle && (
                          <div className="border-b border-gray-50 pb-12">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Latest Story</h3>
                            <Link href={`/read/${latestArticle.slug}`} className="group block">
                              {latestArticle.cover_image && <div className="aspect-[16/9] w-full rounded-xl overflow-hidden mb-6 bg-gray-100"><Image src={latestArticle.cover_image} alt="Cover" width={800} height={450} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>}
                              <h2 className="text-2xl font-bold text-black group-hover:text-gray-700 transition-colors mb-2">{latestArticle.title}</h2>
                              <p className="text-gray-600 line-clamp-3 mb-4 text-[15px] leading-relaxed">{latestArticle.meta_description || "Read more..."}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500"><span>{new Date(latestArticle.created_at).toLocaleDateString()}</span><span>·</span><span>{Math.max(1, Math.ceil(latestArticle.content?.length / 1000))} min read</span></div>
                            </Link>
                          </div>
                        )}
                        <div className="space-y-12 py-8">
                          {remainingArticles.map(a => (
                            <Link key={a.id} href={`/read/${a.slug}`} className="group flex flex-col sm:flex-row gap-6 items-start">
                              <div className="flex-1"><h2 className="text-xl font-bold text-black group-hover:text-gray-700 transition-colors mb-2 leading-tight">{a.title}</h2><p className="text-gray-600 line-clamp-2 mb-3 text-sm">{a.meta_description || "Read story..."}</p><div className="flex items-center gap-2 text-xs text-gray-500"><span>{new Date(a.created_at).toLocaleDateString()}</span></div></div>
                              {a.cover_image && <div className="w-full sm:w-40 aspect-[4/3] rounded-lg overflow-hidden shrink-0 bg-gray-100 order-first sm:order-last"><Image src={a.cover_image} alt="Cover" width={200} height={150} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /></div>}
                            </Link>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="py-8 prose max-w-none">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-bold text-black">About {profile.name || profile.username}</h3>
                      {isOwnProfile && <button onClick={() => setAboutModalOpen(true)} className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-black transition-colors px-4 py-2 rounded-full border border-gray-100 hover:border-gray-200 shadow-sm"><PencilIcon className="w-3.5 h-3.5" />Edit About</button>}
                    </div>
                    {profile.about_rich ? <div className="text-gray-700 text-[16px] leading-relaxed mb-12" dangerouslySetInnerHTML={{ __html: profile.about_rich }} /> : <p className="text-gray-700 text-[16px] leading-relaxed mb-12">{profile.bio || "No about information yet."}</p>}
                    <div className="pt-12 border-t border-gray-100"><h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Connect</h4><div className="flex flex-wrap gap-6">{Object.entries(socials).map(([p,v])=>v && <a key={p} href={v.startsWith('http')?v:`https://${p}.com/${v}`} target="_blank" className="text-sm font-medium text-gray-600 hover:text-black transition-colors capitalize">{p}</a>)}</div></div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="hidden md:block w-80 shrink-0"><div className="sticky top-24"><Image src={profile.avatar || "/default-avatar.jpg"} alt="Avatar" width={88} height={88} className="w-20 h-20 rounded-full object-cover bg-gray-100 mb-6 shadow-sm" /><h2 className="text-lg font-bold text-black mb-1">{profile.name || profile.username}</h2><p className="text-gray-500 text-sm mb-4">@{profile.username}</p>{profile.bio && <p className="text-gray-500 text-sm mb-6 leading-relaxed line-clamp-4">{profile.bio}</p>}<div className="flex items-center justify-between text-sm mb-8"><span className="text-gray-500">Stories</span><span className="font-bold">{articles.length}</span></div>{isOwnProfile ? <button onClick={() => router.push(`/profile/${profile.username}?settings=true`)} className="w-full py-2.5 border border-black rounded-full text-sm font-medium hover:bg-black hover:text-white transition-all mb-8">Edit profile</button> : <button className="w-full py-2.5 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-all mb-8">Follow</button>}</div></div>
            </div>
          </div>
        </div>
      )}

      {/* ── ALL MODALS ── */}
      <Modal open={displayNameModal} onOpenChange={setDisplayNameModal}><div className="p-2 text-black"><h2 className="text-xl font-bold mb-6">Display name</h2><input type="text" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black transition-all mb-4" value={displayName} onChange={e=>setDisplayName(e.target.value)} /><div className="flex justify-end gap-3 mt-4"><button onClick={()=>setDisplayNameModal(false)} className="text-gray-500 px-4">Cancel</button><button onClick={handleUpdateDisplayName} className="px-6 py-2 bg-black text-white rounded-full">Save</button></div></div></Modal>
      <Modal open={usernameModalOpen} onOpenChange={setUsernameModalOpen}><div className="p-2 text-black"><h2 className="text-xl font-bold mb-6">Username</h2><div className="flex items-center gap-2 p-4 bg-gray-50 border border-gray-200 rounded-xl focus-within:border-black transition-all mb-4"><span className="text-gray-400">@</span><input type="text" className="w-full bg-transparent outline-none" value={newUsername} onChange={e=>setNewUsername(e.target.value.toLowerCase())} /></div><div className="flex justify-end gap-3 mt-4"><button onClick={()=>setUsernameModalOpen(false)} className="text-gray-500 px-4">Cancel</button><button onClick={handleUpdateUsername} className="px-6 py-2 bg-black text-white rounded-full">Save</button></div></div></Modal>
      <Modal open={bioModalOpen} onOpenChange={setBioModalOpen}><div className="p-2 text-black"><div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold">Short bio</h2><span className={`text-xs ${bioText.length > 160 ? 'text-red-500' : 'text-gray-400'}`}>{bioText.length}/160</span></div><textarea className={`w-full p-4 bg-gray-50 border rounded-xl outline-none transition-all h-32 resize-none ${bioText.length > 160 ? 'border-red-400' : 'border-gray-200 focus:border-black'}`} value={bioText} onChange={e=>setBioText(e.target.value)} /><div className="flex justify-end gap-3 mt-6"><button onClick={()=>setBioModalOpen(false)} className="text-gray-500 px-4">Cancel</button><button onClick={handleUpdateBio} disabled={bioText.length > 160} className="px-6 py-2 bg-black text-white rounded-full disabled:opacity-50">Save</button></div></div></Modal>
      <Modal open={socialsModalOpen} onOpenChange={setSocialsModalOpen}><div className="p-2 text-black"><h2 className="text-xl font-bold mb-6">Social links</h2><div className="space-y-4">{Object.keys(socials).map(p=>(<div key={p} className="flex flex-col gap-1.5"><label className="text-[10px] uppercase font-bold text-gray-400 ml-1">{p}</label><input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black" value={socials[p]} onChange={e=>setSocials({...socials,[p]:e.target.value})} /></div>))}</div><div className="flex justify-end gap-3 mt-8"><button onClick={()=>setSocialsModalOpen(false)} className="text-gray-500 px-4">Cancel</button><button onClick={handleUpdateSocials} className="px-6 py-2 bg-black text-white rounded-full">Save</button></div></div></Modal>
      <Modal open={preferencesOpen} onOpenChange={setPreferencesOpen}><div className="p-2 text-black"><h2 className="text-xl font-bold mb-4">Interests</h2><p className="text-sm text-gray-500 mb-6">Select 3+ topics</p><div className="flex flex-wrap gap-2">{INTERESTS.map(t=>(<button key={t} onClick={()=>{if(selectedInterests.includes(t)) setSelectedInterests(selectedInterests.filter(i=>i!==t)); else setSelectedInterests([...selectedInterests,t]);}} className={`px-4 py-2 rounded-full border text-sm transition-all ${selectedInterests.includes(t) ? 'bg-black text-white border-black' : 'hover:border-black'}`}>{t}</button>))}</div><div className="flex justify-end gap-3 mt-8"><button onClick={()=>setPreferencesOpen(false)} className="text-gray-500 px-4">Cancel</button><button onClick={handleUpdatePreferences} className="px-6 py-2 bg-black text-white rounded-full">Save</button></div></div></Modal>
      <Modal open={changePasswordOpen} onOpenChange={setChangePasswordOpen}><div className="p-2 text-black"><h2 className="text-xl font-bold mb-6">Change password</h2><input type="password" placeholder="New password" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black mb-4" value={newPassword} onChange={e=>setNewPassword(e.target.value)} /><div className="flex justify-end gap-3"><button onClick={()=>setChangePasswordOpen(false)} className="text-gray-500 px-4">Cancel</button><button onClick={handleUpdatePassword} className="px-6 py-2 bg-black text-white rounded-full">Update</button></div></div></Modal>
      <Modal open={avatarModalOpen} onOpenChange={setAvatarModalOpen}><div className="p-4 text-center text-black flex flex-col items-center"><h2 className="text-xl font-bold mb-8">Profile picture</h2><Image src={profile.avatar || "/default-avatar.jpg"} alt="Preview" width={128} height={128} className="w-32 h-32 rounded-full object-cover mb-8 bg-gray-50 border" /><div className="w-full space-y-3"><button onClick={()=>fileInputRef.current?.click()} className="w-full py-3 bg-black text-white rounded-full font-medium">Upload new</button><button onClick={()=>setAvatarModalOpen(false)} className="w-full py-3 text-gray-500">Cancel</button></div><input type="file" hidden ref={fileInputRef} onChange={handleAvatarChange} /></div></Modal>

      {/* ── About Rich Text Editor Modal ── */}
      <Modal open={aboutModalOpen} onOpenChange={setAboutModalOpen} size="large">
        <div className="p-4 flex flex-col h-[70vh] text-black">
          <h2 className="text-2xl font-bold mb-8">Edit About</h2>
          <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded-xl border border-gray-100">
            {[
              { cmd: 'bold', icon: 'B' }, { cmd: 'italic', icon: 'I' }, { cmd: 'underline', icon: 'U' },
              { cmd: 'insertUnorderedList', icon: '•' }, { cmd: 'insertOrderedList', icon: '1.' },
              { cmd: 'formatBlock', val: 'h2', icon: 'H1' }, { cmd: 'formatBlock', val: 'h3', icon: 'H2' },
              { cmd: 'formatBlock', val: 'blockquote', icon: '“' },
            ].map((btn, i) => (
              <button key={i} onMouseDown={e=>{e.preventDefault(); document.execCommand(btn.cmd, false, btn.val || null);}} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors font-bold text-lg">{btn.icon}</button>
            ))}
          </div>
          <div ref={editorRef} contentEditable suppressContentEditableWarning className="flex-1 p-6 border border-gray-100 rounded-2xl outline-none focus:border-black transition-colors prose max-w-none overflow-y-auto bg-white shadow-inner min-h-[300px]" dangerouslySetInnerHTML={{ __html: aboutContent }} />
          <div className="flex justify-end gap-4 mt-8">
            <button onClick={()=>setAboutModalOpen(false)} className="text-gray-500 font-medium px-4">Cancel</button>
            <button onClick={handleUpdateAbout} disabled={aboutLoading} className="px-8 py-3 bg-black text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50">{aboutLoading ? "Saving..." : "Save Changes"}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Page;
