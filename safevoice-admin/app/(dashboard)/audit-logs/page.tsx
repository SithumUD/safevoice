"use client";

import React, { useState, useEffect } from "react";
import { auditService } from "@/lib/api/audit";
import { AuditLogDTO } from "@/types/api";
import { FileText, Loader2, Info } from "lucide-react";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLogDTO | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await auditService.getAuditLogs(0, 50);
      setLogs(res.content || []);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to fetch security audit logs: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center">
          <FileText className="h-8 w-8 text-indigo-400 mr-3" /> Security Audit Logs
        </h1>
        <p className="text-zinc-400 mt-1">Immutable security trail of administrative actions.</p>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
          <p className="text-sm text-red-400 font-medium">{errorMsg}</p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-4" />
          <p>Loading audit trail...</p>
        </div>
      ) : (
        <div className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-zinc-800/50 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-900/80 text-xs uppercase font-semibold text-zinc-400 border-b border-zinc-800/50">
                <tr>
                  <th scope="col" className="px-6 py-4">Action</th>
                  <th scope="col" className="px-6 py-4">Target Type</th>
                  <th scope="col" className="px-6 py-4">Target ID</th>
                  <th scope="col" className="px-6 py-4">Actor</th>
                  <th scope="col" className="px-6 py-4">IP Address</th>
                  <th scope="col" className="px-6 py-4">Timestamp</th>
                  <th scope="col" className="px-6 py-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-white">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-300">
                      {log.targetType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-500 font-mono text-xs">
                      {log.targetId ? log.targetId.substring(0, 8) + '...' : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-300">
                      {log.actorNickname || log.actorId?.substring(0, 8) || 'SYSTEM'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-400 text-xs">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-400 text-xs">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                        title="View Context JSON"
                      >
                        <Info className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logs.length === 0 && !loading && (
              <div className="p-12 text-center text-zinc-500">
                No audit log records found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* JSON Context Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h2 className="text-lg font-semibold text-white">Audit Log Context</h2>
              <button onClick={() => setSelectedLog(null)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            <pre className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs text-indigo-300 font-mono overflow-x-auto max-h-80">
              {JSON.stringify(selectedLog.detailsJson || selectedLog, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
