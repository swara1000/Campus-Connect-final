import React, { useMemo, useState } from "react";
import { UserRoundCheck, Clock, CheckCircle2, XCircle, Check, X } from "lucide-react";
import { SectionHeader, SearchBar, StatCard } from "./Shared";
import { seedLearningRequests, STATUS_STYLES } from "../data/mockData";
import { formatDate, initials, cardShadowCls, AVATAR_COLORS } from "../utils";

export default function LearningRequests({ notify }) {
  const [requests, setRequests] = useState(seedLearningRequests);
  const [query, setQuery] = useState("");

  const stats = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter((r) => r.status === "Pending").length,
      approved: requests.filter((r) => r.status === "Approved").length,
      rejected: requests.filter((r) => r.status === "Rejected").length,
    }),
    [requests]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter((r) => [r.student, r.subject, r.status].join(" ").toLowerCase().includes(q));
  }, [requests, query]);

  const setStatus = (request, status) => {
    setRequests(requests.map((r) => (r.id === request.id ? { ...r, status } : r)));
    notify({ title: `Request ${status.toLowerCase()}`, subtitle: `${request.student} \u2014 ${request.subject}` });
  };

  return (
    <div>
      <SectionHeader
        title="Learning Requests"
        subtitle="Review student requests and approve or decline access to learning tracks."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
        <StatCard icon={UserRoundCheck} label="Total requests" value={stats.total} tint="bg-blue-50 text-blue-600" />
        <StatCard icon={Clock} label="Pending" value={stats.pending} tint="bg-amber-50 text-amber-600" />
        <StatCard icon={CheckCircle2} label="Approved" value={stats.approved} tint="bg-emerald-50 text-emerald-600" />
        <StatCard icon={XCircle} label="Rejected" value={stats.rejected} tint="bg-red-50 text-red-600" />
      </div>

      <div className={`rounded-2xl border border-slate-100 bg-white ${cardShadowCls} mt-6 overflow-hidden`}>
        <div className="p-5">
          <SearchBar value={query} onChange={setQuery} placeholder="Search requests..." />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-y border-slate-200">
                <th className="px-5 py-3 font-medium">Student</th>
                <th className="px-5 py-3 font-medium">Subject</th>
                <th className="px-5 py-3 font-medium">Requested on</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id} className="border-b border-slate-200 last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`h-8 w-8 shrink-0 rounded-full text-white flex items-center justify-center text-xs font-semibold ${
                          AVATAR_COLORS[i % AVATAR_COLORS.length]
                        }`}
                      >
                        {initials(r.student)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800">{r.student}</p>
                        {r.rollNo && <p className="text-xs text-slate-400">{r.rollNo}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{r.subject}</td>
                  <td className="px-5 py-3 text-slate-600">{formatDate(r.requestedOn)}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[r.status]}`}>
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          r.status === "Approved" ? "bg-emerald-500" : r.status === "Pending" ? "bg-amber-500" : "bg-red-500"
                        }`}
                      />
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {r.status === "Pending" ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setStatus(r, "Approved")}
                          className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 shadow-[0_2px_8px_rgba(5,150,105,0.28)] transition-shadow"
                        >
                          <Check size={13} /> Approve
                        </button>
                        <button
                          onClick={() => setStatus(r, "Rejected")}
                          className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
                        >
                          <X size={13} /> Reject
                        </button>
                      </div>
                    ) : (
                      <p className="text-right text-xs text-slate-400">No action needed</p>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                    No requests match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
