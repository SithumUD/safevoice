"use client";

import React, { useState, useEffect } from "react";
import { reportsService, ResolveReportAction } from "@/lib/api/reports";
import { ReportDTO, ReportStatus } from "@/types/api";
import { ShieldAlert, Loader2, CheckCircle, XCircle, AlertTriangle, Filter } from "lucide-react";

export default function ReportsModerationPage() {
  const [reports, setReports] = useState<ReportDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ReportStatus>("PENDING");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Resolution Modal State
  const [selectedReport, setSelectedReport] = useState<ReportDTO | null>(null);
  const [action, setAction] = useState<ResolveReportAction>("DISMISS");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const fetchReports = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await reportsService.getReports(statusFilter, 0, 50);
      setReports(res.content || []);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to load reports queue: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    setIsSubmitting(true);
    try {
      await reportsService.resolveReport(selectedReport.id, action, notes);
      setReports(reports.filter(r => r.id !== selectedReport.id));
      setSelectedReport(null);
      setNotes("");
    } catch (err: any) {
      alert("Error resolving report: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center">
            <ShieldAlert className="h-8 w-8 text-amber-500 mr-3" /> Moderation Reports Queue
          </h1>
          <p className="text-zinc-400 mt-1">Review user content flags and execute safety actions.</p>
        </div>

        <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 p-1.5 rounded-xl">
          <Filter className="h-4 w-4 text-zinc-500 ml-2" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as ReportStatus)}
            className="bg-transparent text-white text-sm outline-none px-2 py-1 cursor-pointer"
          >
            <option value="PENDING" className="bg-zinc-900">Pending Review</option>
            <option value="APPROVED" className="bg-zinc-900">Approved / Actioned</option>
            <option value="DISMISSED" className="bg-zinc-900">Dismissed</option>
          </select>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
          <p className="text-sm text-red-400 font-medium">{errorMsg}</p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-4" />
          <p>Loading moderation queue...</p>
        </div>
      ) : (
        <div className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-zinc-800/50 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-900/80 text-xs uppercase font-semibold text-zinc-400 border-b border-zinc-800/50">
                <tr>
                  <th scope="col" className="px-6 py-4">Target Type</th>
                  <th scope="col" className="px-6 py-4">Reason</th>
                  <th scope="col" className="px-6 py-4">Reporter</th>
                  <th scope="col" className="px-6 py-4">Details</th>
                  <th scope="col" className="px-6 py-4">Date</th>
                  <th scope="col" className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-white">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {report.targetType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {report.reason}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-300">
                      {report.reporterNickname || report.reporterId?.substring(0, 8) || 'Anonymous Reporter'}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 max-w-xs truncate">
                      {report.details || 'No additional details provided'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-400 text-xs">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                      {report.status === 'PENDING' ? (
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
                        >
                          Review & Resolve
                        </button>
                      ) : (
                        <span className="text-xs text-zinc-500 italic">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reports.length === 0 && !loading && (
              <div className="p-12 text-center text-zinc-500">
                <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-3 opacity-60" />
                <p className="text-lg font-medium text-zinc-300">Queue Clean</p>
                <p className="text-sm mt-1">No reports matching status "{statusFilter}".</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resolution Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-zinc-800">
              <h2 className="text-xl font-semibold text-white">Resolve Moderation Report</h2>
              <button onClick={() => setSelectedReport(null)} className="text-zinc-400 hover:text-white transition-colors">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleResolve} className="p-6 space-y-4">
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
                <div className="text-xs text-zinc-400 uppercase font-semibold">Flag Details</div>
                <div className="text-sm text-zinc-200"><span className="text-zinc-500">Reason:</span> {selectedReport.reason}</div>
                <div className="text-sm text-zinc-200"><span className="text-zinc-500">Details:</span> {selectedReport.details || "N/A"}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Action</label>
                <select
                  value={action}
                  onChange={e => setAction(e.target.value as ResolveReportAction)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white outline-none"
                >
                  <option value="DISMISS">Dismiss Report (No Violation)</option>
                  <option value="DELETE_CONTENT">Delete Flagged Content (Soft Delete)</option>
                  <option value="SUSPEND_USER">Suspend Target User (Revoke Sessions)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Administrative Notes</label>
                <textarea
                  required
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Provide resolution notes..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white outline-none resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Submit Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
