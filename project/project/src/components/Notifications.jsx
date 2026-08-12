import React, { useMemo, useState } from "react";
import { Bell, Send, Save, Trash2, Mail } from "lucide-react";
import { SectionHeader, SearchBar, Field, Select, EmptyState, ConfirmDialog } from "./Shared";
import { seedNotifications, STATUS_STYLES } from "../data/mockData";
import { inputCls, textareaCls, uid, cardShadowCls, secondaryBtnCls, primaryBtnCls } from "../utils";

const CHANNEL_ICON = { push: Bell, email: Mail, "in-app": Bell };

export default function Notifications({ notify }) {
  const [items, setItems] = useState(seedNotifications);
  const [tab, setTab] = useState("All");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState({ title: "", message: "", audience: "All students", channel: "push" });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((n) => {
      const matchesTab = tab === "All" || n.status === tab;
      const matchesQ = !q || [n.title, n.message].join(" ").toLowerCase().includes(q);
      return matchesTab && matchesQ;
    });
  }, [items, query, tab]);

  const resetDraft = () => setDraft({ title: "", message: "", audience: "All students", channel: "push" });

  const send = (status) => {
    if (!draft.title.trim() || !draft.message.trim()) return;
    const entry = {
      id: uid("n"),
      title: draft.title,
      message: draft.message,
      audience: draft.audience,
      channel: draft.channel,
      date: "Aug 8, 2026",
      reads: 0,
      status,
    };
    setItems([entry, ...items]);
    notify({ title: status === "Sent" ? "Notification sent" : "Draft saved", subtitle: draft.title });
    resetDraft();
  };

  const handleDelete = (n) => {
    setItems(items.filter((i) => i.id !== n.id));
    notify({ title: "Notification deleted", subtitle: n.title });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    handleDelete(deleteTarget);
    setDeleteTarget(null);
  };

  return (
    <div>
      <SectionHeader title="Notifications" subtitle="Compose, schedule and track campus-wide announcements." />

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5 mt-5 items-start">
        <div className={`rounded-2xl border border-slate-100 bg-white ${cardShadowCls} p-5`}>
          <h3 className="font-semibold text-slate-900">Compose notification</h3>
          <p className="text-sm text-slate-500 mt-0.5 mb-4">Delivered instantly to the selected audience.</p>

          <Field label="Title">
            <input
              className={inputCls}
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Placement drive tomorrow"
            />
          </Field>
          <Field label="Message">
            <textarea
              className={textareaCls + " min-h-[100px]"}
              value={draft.message}
              onChange={(e) => setDraft({ ...draft, message: e.target.value })}
              placeholder="Write a clear, short message..."
            />
          </Field>
          <Field label="Audience">
            <Select value={draft.audience} onChange={(e) => setDraft({ ...draft, audience: e.target.value })}>
              {["All students", "Final year", "Club members", "Faculty"].map((a) => (
                <option key={a}>{a}</option>
              ))}
            </Select>
          </Field>
          <Field label="Channel">
            <Select value={draft.channel} onChange={(e) => setDraft({ ...draft, channel: e.target.value })}>
              {["push", "email", "in-app"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => send("Sent")}
              className={`flex items-center gap-1.5 ${primaryBtnCls}`}
            >
              <Send size={15} /> Send now
            </button>
            <button
              onClick={() => send("Draft")}
              className={`flex items-center gap-1.5 ${secondaryBtnCls}`}
            >
              <Save size={15} /> Save draft
            </button>
          </div>
        </div>

        <div className={`rounded-2xl border border-slate-100 bg-white ${cardShadowCls} overflow-hidden`}>
          <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-3 border-b border-slate-200">
            <SearchBar value={query} onChange={setQuery} placeholder="Search notifications..." className="flex-1" />
            <div className="flex bg-slate-100 rounded-full p-1 self-start">
              {["All", "Sent", "Scheduled", "Drafts"].map((t) => {
                const key = t === "Drafts" ? "Draft" : t;
                return (
                  <button
                    key={t}
                    onClick={() => setTab(key)}
                    className={`px-3.5 py-1.5 text-sm rounded-full font-medium transition ${
                      tab === key ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="divide-y divide-slate-200 max-h-[560px] overflow-y-auto">
            {filtered.map((n) => {
              const Icon = CHANNEL_ICON[n.channel] || Bell;
              return (
                <div key={n.id} className="p-5 flex gap-3">
                  <div className="h-9 w-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-slate-900">{n.title}</h4>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[n.status]}`}>{n.status}</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{n.message}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      {n.audience} \u00b7 {n.channel} \u00b7 {n.date}
                      {n.reads > 0 ? ` \u00b7 ${n.reads} reads` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => setDeleteTarget(n)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-1.5 self-start transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
            {filtered.length === 0 && <EmptyState text="No notifications here yet." />}
          </div>
        </div>
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this notification?"
          message={`"${deleteTarget.title}" will be permanently removed. This can't be undone.`}
          confirmLabel="Delete notification"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
