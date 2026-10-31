"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { LogIn, LogOut, User as UserIcon } from "lucide-react";

export default function AuthButton() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin }
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) return <div className="w-20 h-8 bg-zinc-900 animate-pulse rounded-lg" />;

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/90 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-300">
          <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">{user.email?.split("@")[0]}</span>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1 px-3 py-1.5 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white transition-all cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer"
    >
      <LogIn className="w-3.5 h-3.5" />
      Sign In
    </button>
  );
}