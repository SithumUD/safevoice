"use client";

import React, { useState, useEffect } from "react";
import { globalNotificationsService, CreateGlobalNotificationPayload } from "@/lib/api/globalNotifications";
import { GlobalNotificationDTO, GlobalNotificationType } from "@/types/api";
import { Megaphone, Send, Bell, Info, AlertTriangle, Sparkles, CheckCircle, RefreshCw } from "lucide-react";

export default function AnnouncementsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<GlobalNotificationType>("SYSTEM_ANNOUNCEMENT");
  const [relatedTopicId, setRelatedTopicId] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [broadcasts, setBroadcasts] = useState<GlobalNotificationDTO[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  const fetchBroadcasts = async () => {
    setIsLoadingList(true);
    try {
      const data = await globalNotificationsService.getRecentBroadcasts(0, 20);
      setBroadcasts(data.content || []);
    } catch (err) {
      console.error("Failed to load broadcasts:", err);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const payload: CreateGlobalNotificationPayload = {
        type,
        title: title.trim(),
        body: body.trim(),
        relatedTopicId: relatedTopicId.trim() || undefined,
      };

      await globalNotificationsService.createBroadcast(payload);
      setSuccessMessage("Broadcast announcement successfully sent to all community members!");
      setTitle("");
      setBody("");
      setRelatedTopicId("");
      fetchBroadcasts();
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to dispatch broadcast announcement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <Megaphone className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Global Announcements</h1>
            <p className="text-sm text-zinc-400">Broadcast system-wide announcements to all mobile app users</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Form + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
              <Send className="h-5 w-5 mr-2.5 text-indigo-400" />
              Compose Broadcast
            </h2>

            {successMessage && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span className="text-sm font-medium">{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <span className="text-sm font-medium">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Announcement Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(
                    [
                      { id: "SYSTEM_ANNOUNCEMENT", label: "System Alert", icon: Info },
                      { id: "NEW_TOPIC", label: "Featured Topic", icon: Sparkles },
                      { id: "NEW_POLL", label: "Community Poll", icon: Bell },
                    ] as const
                  ).map((item) => {
                    const Icon = item.icon;
                    const isSelected = type === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setType(item.id)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                          isSelected
                            ? "bg-indigo-500/15 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-500/10"
                            : "bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        <Icon className="h-5 w-5 mb-1.5" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Platform Maintenance Scheduled for 10 PM"
                  maxLength={100}
                  required
                  className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Message Body
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write clear, concise details for mobile users..."
                  rows={4}
                  maxLength={500}
                  required
                  className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl p-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                />
                <div className="text-right mt-1 text-xs text-zinc-600">
                  {body.length}/500
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Related Topic ID (Optional)
                </label>
                <input
                  type="text"
                  value={relatedTopicId}
                  onChange={(e) => setRelatedTopicId(e.target.value)}
                  placeholder="UUID of topic to open when tapped..."
                  className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !body.trim()}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Broadcast Now</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-xl">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-6 flex items-center">
              <Bell className="h-4 w-4 mr-2 text-indigo-400" />
              Mobile App Live Preview
            </h2>

            {/* Mobile Mockup Card */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                  SV
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">SafeVoice System</div>
                  <div className="text-[10px] text-zinc-500">Just now • Broadcast</div>
                </div>
              </div>

              <div className="text-sm font-semibold text-white mb-1.5">
                {title.trim() || "Notification Title Here"}
              </div>
              <div className="text-xs text-zinc-400 leading-relaxed break-words">
                {body.trim() || "Your message preview will render here in real-time as you type..."}
              </div>

              {relatedTopicId.trim() && (
                <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-indigo-400 font-medium">
                  <span>Opens related topic</span>
                  <span>Tap to view →</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast History Table */}
      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Recent Broadcast History</h2>
          <button
            onClick={fetchBroadcasts}
            className="p-2 text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingList ? "animate-spin" : ""}`} />
          </button>
        </div>

        {isLoadingList ? (
          <div className="text-center py-12 text-zinc-500 text-sm">Loading broadcast history...</div>
        ) : broadcasts.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-sm">No announcements broadcasted yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-zinc-950/60 text-xs font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {broadcasts.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-xs">
                      <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-white max-w-xs truncate">{item.title}</td>
                    <td className="px-4 py-3 max-w-md truncate">{item.body}</td>
                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
