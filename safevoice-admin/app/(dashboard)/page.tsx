"use client";

import React, { useEffect, useState } from "react";
import { Users, MessageSquare, BarChart2, ShieldAlert, UserX, Loader2, RefreshCw } from "lucide-react";
import { metricsService } from "@/lib/api/metrics";
import { SystemMetricsDTO } from "@/types/api";

export default function DashboardOverview() {
  const [metrics, setMetrics] = useState<SystemMetricsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMetrics = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    setErrorMsg(null);
    try {
      const data = await metricsService.getMetrics();
      setMetrics(data);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error("Failed to load dashboard telemetry metrics:", err);
      setErrorMsg(err.message || "Failed to connect to backend telemetry service.");
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(() => fetchMetrics(true), 30_000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      name: "Total Users",
      value: metrics ? metrics.totalUsers.toLocaleString() : "-",
      subtext: `${metrics ? metrics.activeUsers : 0} active • ${metrics ? metrics.newUsersLast7Days : 0} new (7d)`,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      name: "Active Topics",
      value: metrics ? metrics.totalTopics.toLocaleString() : "-",
      subtext: `${metrics ? metrics.activeTopics : 0} active • ${metrics ? metrics.newTopicsLast7Days : 0} new (7d)`,
      icon: MessageSquare,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
    {
      name: "Community Polls",
      value: metrics ? metrics.totalPolls.toLocaleString() : "-",
      subtext: `${metrics ? metrics.totalPollVotes.toLocaleString() : 0} total votes cast`,
      icon: BarChart2,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      name: "Pending Moderation Reports",
      value: metrics ? metrics.pendingReports.toLocaleString() : "-",
      subtext: `${metrics ? metrics.resolvedReportsLast30Days : 0} resolved in last 30d`,
      icon: ShieldAlert,
      color: metrics && metrics.pendingReports > 0 ? "text-amber-500" : "text-emerald-500",
      bg: metrics && metrics.pendingReports > 0 ? "bg-amber-500/10" : "bg-emerald-500/10",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard Overview</h1>
          <p className="text-zinc-400 mt-1">Platform telemetry and community activity overview.</p>
        </div>
        <div className="flex items-center space-x-3">
          {lastUpdated && (
            <span className="text-xs text-zinc-500 hidden sm:inline">
              Auto-refreshed: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => fetchMetrics(false)}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-xl text-sm font-medium transition-colors w-fit"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Stats
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-4 flex items-center justify-between">
          <p className="text-sm text-red-400 font-medium">{errorMsg}</p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-4" />
          <p>Loading live telemetry stats...</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.name}
                  className="relative overflow-hidden rounded-2xl bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 p-6 shadow-xl hover:border-zinc-700/50 transition-colors duration-300 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-zinc-400">{stat.name}</p>
                      <p className="mt-2 text-3xl font-semibold text-white tracking-tight">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-xs text-zinc-400">
                    <span>{stat.subtext}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Security & Moderation Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="rounded-2xl bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <UserX className="h-5 w-5 text-amber-500 mr-2" /> User Account Status Breakdown
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                  <span className="text-sm text-zinc-300">Active Community Users</span>
                  <span className="text-sm font-bold text-emerald-400">{metrics?.activeUsers || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                  <span className="text-sm text-zinc-300">Temporarily Suspended Accounts</span>
                  <span className="text-sm font-bold text-amber-400">{metrics?.suspendedUsers || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                  <span className="text-sm text-zinc-300">Permanently Banned Accounts</span>
                  <span className="text-sm font-bold text-red-400">{metrics?.bannedUsers || 0}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <ShieldAlert className="h-5 w-5 text-indigo-400 mr-2" /> Moderation Health
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                  <span className="text-sm text-zinc-300">Pending User Flag Reports</span>
                  <span className="text-sm font-bold text-amber-400">{metrics?.pendingReports || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                  <span className="text-sm text-zinc-300">Total Discussions Posted</span>
                  <span className="text-sm font-bold text-indigo-400">{metrics?.totalTopics || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                  <span className="text-sm text-zinc-300">Total User Comments Posted</span>
                  <span className="text-sm font-bold text-indigo-400">{metrics?.totalComments || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
