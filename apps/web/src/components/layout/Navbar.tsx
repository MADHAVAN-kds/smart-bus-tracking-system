import {
  Bell,
  Search,
  Menu,
  UserCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type UserProfile = {
  full_name: string;
  email: string;
  role: string;
};

type NavbarProps = {
  onMenuClick: () => void;
};

export default function Navbar({ onMenuClick }: NavbarProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        // Get logged-in user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          return;
        }

        // Get profile of logged-in user
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, email, role")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Navbar profile error:", error);
          return;
        }

        setProfile(data);
      } catch (error) {
        console.error("Navbar error:", error);
      }
    }

    loadProfile();
  }, []);

  return (
    <header className="sticky top-0 z-30 flex min-h-16 w-full items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 shadow-sm sm:min-h-20 sm:gap-4 sm:px-6 lg:px-8">

      {/* Left */}
      <div className="flex items-center gap-4">

        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="rounded-lg p-2 hover:bg-slate-100 md:hidden"
        >
          <Menu size={22} />
        </button>

        <div>
          <h1 className="text-lg font-bold text-slate-800 sm:text-2xl">
            Dashboard
          </h1>

        <p className="hidden text-sm text-slate-500 sm:block">
          SmartBus Tracker Management System
        </p>
        </div>

      </div>

      {/* Center */}
      <div className="hidden lg:flex items-center bg-slate-100 rounded-xl px-4 py-2 w-[350px]">

        <Search size={18} className="text-slate-400" />

        <input
          placeholder="Search buses, students..."
          className="bg-transparent outline-none ml-3 w-full"
        />

      </div>

      {/* Right */}
      <div className="flex items-center gap-6">

        <button className="relative p-2 rounded-lg hover:bg-slate-100">

          <Bell size={22} />

          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>

        </button>

        <div className="flex items-center gap-3">

          <UserCircle
            size={40}
            className="text-blue-600"
          />

          <div>

            <p className="font-semibold">
              {profile?.full_name || "Loading..."}
            </p>

            <p className="text-xs text-slate-500">
              {profile?.email || ""}
            </p>

          </div>

        </div>

      </div>

    </header>
  );
}