import React, { useMemo, useState } from "react";
import { BookOpen, Layers, GraduationCap, Pencil, Trash2, Plus, FileText } from "lucide-react";
import { SectionHeader, SearchBar, Modal, Field, Select, ConfirmDialog, StatCard } from "./Shared";
import { seedMaterials, SEMESTER_OPTIONS } from "../data/mockData";
import { formatDate, inputCls, uid, cardShadowCls, secondaryBtnCls, primaryBtnCls } from "../utils";

function MaterialForm({ initial, onCancel, onSubmit }) {
  const [form, setForm] = useState(
    initial || { title: "", subject: "", semester: "5", fileName: "" }
  );
  const [file, setFile] = useState(null);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.subject.trim()) return;
        onSubmit({ ...form, fileName: file?.name || form.fileName || "No file" });
      }}
    >
      <Field label="Material title">
        <input className={inputCls} value={form.title} onChange={set("title")} placeholder="e.g. DBMS Notes" required />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Subject">
          <input className={inputCls} value={form.subject} onChange={set("subject")} placeholder="e.g. DBMS" required />
        </Field>
        <Field label="Semester">
          <Select value={form.semester} onChange={set("semester")}>
            {SEMESTER_OPTIONS.map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Upload file">
        <input
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-600 shadow-[0_1px_3px_rgba(15,23,42,0.12)] file:mr-3 file:rounded-full file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
        />
        {form.fileName && !file && <p className="text-xs text-slate-400 mt-1.5">Current file: {form.fileName}</p>}
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
          {initial ? "Save changes" : "Upload material"}
        </button>
      </div>
    </form>
  );
}

export default function StudyMaterials({ notify }) {
  const [materials, setMaterials] = useState(seedMaterials);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const stats = useMemo(
    () => ({
      total: materials.length,
      subjects: new Set(materials.map((m) => m.subject)).size,
      semesters: new Set(materials.map((m) => m.semester)).size,
    }),
    [materials]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return materials;
    return materials.filter((m) => [m.title, m.subject, m.semester, m.fileName].join(" ").toLowerCase().includes(q));
  }, [materials, query]);

  const handleCreate = (form) => {
    setMaterials([{ ...form, id: uid("m"), uploaded: new Date().toISOString().slice(0, 10) }, ...materials]);
    setModal(null);
    notify({ title: "Material uploaded", subtitle: form.title });
  };

  const handleEdit = (form) => {
    setMaterials(materials.map((m) => (m.id === modal.material.id ? { ...m, ...form } : m)));
    setModal(null);
    notify({ title: "Material updated", subtitle: form.title });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setMaterials(materials.filter((m) => m.id !== deleteTarget.id));
    notify({ title: "Material deleted", subtitle: deleteTarget.title });
    setDeleteTarget(null);
  };

  return (
    <div>
      <SectionHeader
        title="Study Materials"
        subtitle="Upload, organize and manage learning resources available to students."
        action={{ label: "Upload material", icon: <Plus size={16} />, onClick: () => setModal({ mode: "create" }) }}
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
        <StatCard icon={BookOpen} label="Total materials" value={stats.total} tint="bg-blue-50 text-blue-600" />
        <StatCard icon={Layers} label="Subjects covered" value={stats.subjects} tint="bg-purple-50 text-purple-600" />
        <StatCard icon={GraduationCap} label="Semesters covered" value={stats.semesters} tint="bg-emerald-50 text-emerald-600" />
      </div>

      <div className={`rounded-2xl border border-slate-100 bg-white ${cardShadowCls} mt-6 overflow-hidden`}>
        <div className="p-5">
          <SearchBar value={query} onChange={setQuery} placeholder="Search materials..." />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-y border-slate-200">
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Subject</th>
                <th className="px-5 py-3 font-medium">Semester</th>
                <th className="px-5 py-3 font-medium">File</th>
                <th className="px-5 py-3 font-medium">Uploaded</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b border-slate-200 last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                        <FileText size={14} />
                      </div>
                      <span className="font-medium text-slate-800">{m.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{m.subject}</td>
                  <td className="px-5 py-3 text-slate-600">Semester {m.semester}</td>
                  <td className="px-5 py-3 text-slate-500">{m.fileName}</td>
                  <td className="px-5 py-3 text-slate-600">{formatDate(m.uploaded)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setModal({ mode: "edit", material: m })}
                        className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full p-1.5 transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(m)}
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
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                    No materials match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal
          title={modal.mode === "create" ? "Upload study material" : "Edit material"}
          subtitle={modal.mode === "create" ? "Visible to eligible students instantly." : modal.material.title}
          onClose={() => setModal(null)}
        >
          <MaterialForm
            initial={modal.mode === "edit" ? modal.material : null}
            onCancel={() => setModal(null)}
            onSubmit={modal.mode === "create" ? handleCreate : handleEdit}
          />
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this material?"
          message={`"${deleteTarget.title}" will be permanently removed. This can't be undone.`}
          confirmLabel="Delete material"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
