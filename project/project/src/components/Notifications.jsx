import React, { useEffect, useMemo, useState } from "react";
import { Bell, Send, Save, Trash2, Mail } from "lucide-react";
import { SectionHeader, SearchBar, Field, Select, EmptyState, ConfirmDialog } from "./Shared";
import { seedNotifications, STATUS_STYLES } from "../data/mockData";
import { inputCls, textareaCls, uid, cardShadowCls, secondaryBtnCls, primaryBtnCls } from "../utils";
import { API_BASE_URL } from "../api-config.js";

const API_URL = `${API_BASE_URL}/api/notifications/admin`;

const CHANNEL_ICON = { push: Bell, email: Mail, "in-app": Bell };

// Normalizes a backend AdminBroadcast document into the shape this
// screen already renders (id, date string, reads count, etc).
function formatNotification(n) {
  return {
    ...n,
    id: n._id || n.id,
    date: n.sentAt || n.createdAt
      ? new Date(n.sentAt || n.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "",
    reads: n.reads || 0,
  };
}

export default function Notifications({ notify }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState("All");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState({ title: "", message: "", audience: "All students", channel: "push" });
  const [deleteTarget, setDeleteTarget] = useState(null);

  /* =====================================================
     FETCH NOTIFICATIONS
  ===================================================== */

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("adminToken");

      if (!token) {
        setItems(seedNotifications);
        return;
      }

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(data.message || "Failed to fetch notifications");
        setItems(seedNotifications);
        return;
      }

      setItems((data.notifications || []).map(formatNotification));
    } catch (error) {
      console.error("Fetch notifications error:", error);
      setItems(seedNotifications);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((n) => {
      const matchesTab = tab === "All" || n.status === tab;
      const matchesQ = !q || [n.title, n.message].join(" ").toLowerCase().includes(q);
      return matchesTab && matchesQ;
    });
  }, [items, query, tab]);

  const resetDraft = () => setDraft({ title: "", message: "", audience: "All students", channel: "push" });

  /* =====================================================
     SEND / SAVE DRAFT
  ===================================================== */

  const send = async (status) => {
    if (!draft.title.trim() || !draft.message.trim()) return;

    const token = localStorage.getItem("adminToken");

    if (!token) {
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
      return;
    }

    try {
      setSending(true);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: draft.title.trim(),
          message: draft.message.trim(),
          audience: draft.audience,
          channel: draft.channel,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        notify({ title: "Failed to save notification", subtitle: data.message || "Please try again." });
        return;
      }

      setItems((previous) => [formatNotification(data.notification), ...previous]);
      notify({ title: status === "Sent" ? "Notification sent" : "Draft saved", subtitle: draft.title });
      resetDraft();
    } catch (error) {
      console.error("Send notification error:", error);
      notify({ title: "Cannot connect to backend.", subtitle: "Please try again." });
    } finally {
      setSending(false);
    }
  };

  /* =====================================================
     DELETE
  ===================================================== */

  const handleDelete = async (n) => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      setItems(items.filter((i) => i.id !== n.id));
      notify({ title: "Notification deleted", subtitle: n.title });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${n.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        notify({ title: "Failed to delete notification", subtitle: data.message || "Please try again." });
        return;
      }

      setItems(items.filter((i) => i.id !== n.id));
      notify({ title: "Notification deleted", subtitle: n.title });
    } catch (error) {
      console.error("Delete notification error:", error);
      notify({ title: "Cannot connect to backend.", subtitle: "Please try again." });
    }
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
              disabled={sending}
              className={`flex items-center gap-1.5 ${primaryBtnCls} disabled:opacity-60`}
            >
              <Send size={15} /> {sending ? "Sending..." : "Send now"}
            </button>
            <button
              onClick={() => send("Draft")}
              disabled={sending}
              className={`flex items-center gap-1.5 ${secondaryBtnCls} disabled:opacity-60`}
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
            {loading && (
              <div className="p-10 text-center text-sm text-slate-400">Loading notifications...</div>
            )}
            {!loading &&
              filtered.map((n) => {
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
            {!loading && filtered.length === 0 && <EmptyState text="No notifications here yet." />}
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
