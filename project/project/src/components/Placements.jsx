import React, { useMemo, useState } from "react";
import { Briefcase, CheckCircle2, Calendar, Users, Pencil, Trash2, Plus } from "lucide-react";
import { SectionHeader, SearchBar, Modal, Field, ConfirmDialog, StatCard } from "./Shared";
import { seedDrives, STATUS_STYLES, DRIVE_STATUS_CYCLE } from "../data/mockData";
import { formatDate, initials, inputCls, textareaCls, uid, cardShadowCls, secondaryBtnCls, primaryBtnCls } from "../utils";

function DriveForm({ initial, onCancel, onSubmit }) {
  const [form, setForm] = useState(
    initial || {
      company: "",
      role: "",
      desc: "",
      package: "",
      location: "",
      deadline: "",
      eligibility: "",
      status: "Upcoming",
    }
  );
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!form.company.trim() || !form.role.trim()) return;
        onSubmit(form);
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="Company">
          <input className={inputCls} value={form.company} onChange={set("company")} placeholder="e.g. Nimbus Labs" required />
        </Field>
        <Field label="Role">
          <input className={inputCls} value={form.role} onChange={set("role")} placeholder="e.g. SDE Intern" required />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Package">
          <input className={inputCls} value={form.package} onChange={set("package")} placeholder="₹12 LPA" />
        </Field>
        <Field label="Location">
          <input className={inputCls} value={form.location} onChange={set("location")} placeholder="e.g. Bengaluru" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Eligibility">
          <input
            className={inputCls}
            value={form.eligibility}
            onChange={set("eligibility")}
            placeholder="e.g. CGPA 7.0+, no active backlogs"
          />
        </Field>
        <Field label="Deadline">
          <input type="date" className={inputCls} value={form.deadline} onChange={set("deadline")} required />
        </Field>
      </div>
      <Field label="Description">
        <textarea
          className={textareaCls + " min-h-[70px]"}
          value={form.desc}
          onChange={set("desc")}
          placeholder="What the role involves, team, and responsibilities"
        />
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className={secondaryBtnCls}
        >
          Cancel
        </button>
        <button type="submit" className={primaryBtnCls}>
          {initial ? "Save changes" : "Create drive"}
        </button>
      </div>
    </form>
  );
}

export default function Placements({ notify }) {
  const [drives, setDrives] = useState(seedDrives);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const stats = useMemo(
    () => ({
      total: drives.length,
      open: drives.filter((d) => d.status === "Open").length,
      upcoming: drives.filter((d) => d.status === "Upcoming").length,
      applicants: drives.reduce((s, d) => s + Number(d.applicants || 0), 0),
    }),
    [drives]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return drives;
    return drives.filter((d) => [d.company, d.role, d.location].join(" ").toLowerCase().includes(q));
  }, [drives, query]);

  const handleCreate = (form) => {
    setDrives([{ ...form, id: uid("d"), applicants: 0 }, ...drives]);
    setModal(null);
    notify({ title: "Drive published", subtitle: form.company });
  };

  const handleEdit = (form) => {
    setDrives(drives.map((d) => (d.id === modal.drive.id ? { ...d, ...form } : d)));
    setModal(null);
    notify({ title: "Drive updated", subtitle: form.company });
  };

  const handleDelete = (drive) => {
    setDrives(drives.filter((d) => d.id !== drive.id));
    notify({ title: "Drive deleted", subtitle: drive.company });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    handleDelete(deleteTarget);
    setDeleteTarget(null);
  };

  const cycleStatus = (drive) => {
    const currentIndex = DRIVE_STATUS_CYCLE.indexOf(drive.status);
    const nextStatus = DRIVE_STATUS_CYCLE[(currentIndex + 1) % DRIVE_STATUS_CYCLE.length];
    setDrives(drives.map((d) => (d.id === drive.id ? { ...d, status: nextStatus } : d)));
    notify({ title: "Status updated", subtitle: `${drive.company} \u2014 ${nextStatus}` });
  };

  return (
    <div>
      <SectionHeader
        title="Placements Management"
        subtitle="Publish drives, track applicants and manage deadlines."
        action={{ label: "New drive", icon: <Plus size={16} />, onClick: () => setModal({ mode: "create" }) }}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
        <StatCard icon={Briefcase} label="Total drives" value={stats.total} tint="bg-blue-50 text-blue-600" />
        <StatCard icon={CheckCircle2} label="Open now" value={stats.open} tint="bg-emerald-50 text-emerald-600" />
        <StatCard icon={Calendar} label="Upcoming" value={stats.upcoming} tint="bg-amber-50 text-amber-600" />
        <StatCard icon={Users} label="Total applicants" value={stats.applicants} tint="bg-blue-50 text-blue-600" />
      </div>

      <div className={`rounded-2xl border border-slate-100 bg-white ${cardShadowCls} mt-6 overflow-hidden`}>
        <div className="p-5">
          <SearchBar value={query} onChange={setQuery} placeholder="Search drives..." />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-y border-slate-200">
                <th className="px-5 py-3 font-medium">Company</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Package</th>
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium">Deadline</th>
                <th className="px-5 py-3 font-medium">Applicants</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-b border-slate-200 last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-semibold">
                        {initials(d.company)}
                      </div>
                      <span className="font-medium text-slate-800">{d.company}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{d.role}</td>
                  <td className="px-5 py-3 text-slate-600">{d.package}</td>
                  <td className="px-5 py-3 text-slate-600">{d.location}</td>
                  <td className="px-5 py-3 text-slate-600">{formatDate(d.deadline)}</td>
                  <td className="px-5 py-3 text-slate-600">{d.applicants}</td>
                  <td className="px-5 py-3">
                    <button
                      type="button"
                      onClick={() => cycleStatus(d)}
                      title="Click to change status"
                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer hover:opacity-80 transition-opacity ${STATUS_STYLES[d.status]}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          d.status === "Open" ? "bg-emerald-500" : d.status === "Upcoming" ? "bg-amber-500" : "bg-slate-400"
                        }`}
                      />
                      {d.status}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setModal({ mode: "edit", drive: d })}
                        className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full p-1.5 transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(d)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-1.5 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-slate-400">
                    No drives match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal
          title={modal.mode === "create" ? "New placement drive" : "Edit drive"}
          subtitle={modal.mode === "create" ? "Details are visible to eligible students instantly." : modal.drive.company}
          onClose={() => setModal(null)}
        >
          <DriveForm
            initial={modal.mode === "edit" ? modal.drive : null}
            onCancel={() => setModal(null)}
            onSubmit={modal.mode === "create" ? handleCreate : handleEdit}
          />
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this drive?"
          message={`"${deleteTarget.company} \u2014 ${deleteTarget.role}" will be permanently removed. This can't be undone.`}
          confirmLabel="Delete drive"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
