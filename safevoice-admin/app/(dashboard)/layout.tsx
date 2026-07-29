"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "@/lib/api/auth";
import { UserDTO } from "@/types/api";
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  BarChart2, 
  ShieldAlert,
  FileText,
  LogOut, 
  ShieldCheck,
  Menu,
  Megaphone
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Users", href: "/users", icon: Users },
  { name: "Topics", href: "/topics", icon: MessageSquare },
  { name: "Polls", href: "/polls", icon: BarChart2 },
  { name: "Moderation Queue", href: "/reports", icon: ShieldAlert, hasBadge: true },
  { name: "Announcements", href: "/announcements", icon: Megaphone },
  { name: "Audit Logs", href: "/audit-logs", icon: FileText },
];

import { reportsService } from "@/lib/api/reports";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserDTO | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [pendingReportsCount, setPendingReportsCount] = useState<number>(0);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await authService.getMe();
        if (!user) {
          router.push("/login?error=Session expired. Please log in again.");
          return;
        }
        setUserProfile(user);
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        router.push("/login?error=Session expired. Please log in again.");
      }
    };
    const fetchReportsCount = async () => {
      try {
        const res = await reportsService.getReports('PENDING', 0, 1);
        setPendingReportsCount(res.totalElements || 0);
      } catch (err) {
        // Silently ignore report fetch error
      }
    };

    fetchUser();
    fetchReportsCount();

    const interval = setInterval(fetchReportsCount, 60_000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    await authService.logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex selection:bg-indigo-500/30">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-zinc-900/50 backdrop-blur-xl border-r border-zinc-800/50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div className="h-20 flex items-center px-8 border-b border-zinc-800/50 space-x-3">
            <img src="/logo.png" alt="SafeVoice" className="h-9 w-9 rounded-xl object-cover shadow-lg border border-teal-500/30" />
            <span className="text-xl font-bold tracking-tight text-white">SafeVoice</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href + "/"));
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "bg-indigo-500/10 text-indigo-400"
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100"
                  }`}
                >
                  <div className="flex items-center">
                    <Icon 
                      className={`h-5 w-5 mr-3 transition-colors duration-200 ${
                        isActive ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300"
                      }`} 
                    />
                    {item.name}
                  </div>

                  {item.hasBadge && pendingReportsCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-rose-500 text-white rounded-full animate-pulse shadow-md shadow-rose-500/30">
                      {pendingReportsCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Admin Profile / Logout */}
          <div className="p-4 border-t border-zinc-800/50">
            <button 
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-zinc-400 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-colors duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <div className="h-5 w-5 mr-3 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
              ) : (
                <LogOut className="h-5 w-5 mr-3 text-zinc-500 group-hover:text-red-400 transition-colors" />
              )}
              {isLoggingOut ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-zinc-950/50 backdrop-blur-xl border-b border-zinc-800/50 sticky top-0 z-30">
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="ml-4 text-lg font-bold text-white tracking-tight">SafeVoice</span>
          </div>
          
          <div className="flex-1 flex justify-end items-center space-x-4">
            <div className="hidden md:flex flex-col items-end mr-4">
              <span className="text-sm font-medium text-white">{userProfile ? userProfile.nickname : "Admin"}</span>
              <span className="text-xs text-zinc-500">{userProfile?.email || ""}</span>
            </div>
            {userProfile?.avatarUrl ? (
              <img 
                src={userProfile.avatarUrl} 
                alt="Profile" 
                className="h-10 w-10 rounded-full border-2 border-zinc-800 object-cover shadow-lg shadow-indigo-500/20"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 border-zinc-800 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="text-sm font-bold text-white">
                  {userProfile?.nickname ? userProfile.nickname.charAt(0).toUpperCase() : "A"}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
