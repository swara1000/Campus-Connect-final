import React, { useEffect, useMemo, useState } from "react";
import { Briefcase, CheckCircle2, XCircle, Users, Pencil, Trash2, Plus } from "lucide-react";
import { SectionHeader, SearchBar, Modal, Field, Select, ConfirmDialog, StatCard } from "./Shared";
import { seedDrives } from "../data/mockData";
import { formatDate, inputCls, textareaCls, cardShadowCls, secondaryBtnCls, primaryBtnCls } from "../utils";
import { API_BASE_URL } from "../api-config.js";

/* =====================================================
   BACKEND API URL
===================================================== */

const API_URL = `${API_BASE_URL}/api/placements`;

/* =====================================================
   STATUS STYLES
   (the Placement model only supports Active/Closed, unlike
   the Open/Upcoming/Closed cycle used elsewhere in the demo data)
===================================================== */

const PLACEMENT_STATUS_STYLES = {
  Active: "bg-emerald-50 text-emerald-700",
  Closed: "bg-slate-100 text-slate-500",
};

const PLACEMENT_TYPES = ["Internship", "Full-time", "Job Drive"];

/* =====================================================
   DATE HELPERS
   Mongo returns the deadline as a full ISO datetime string
   (e.g. 2026-08-12T00:00:00.000Z); the <input type="date">
   field and the shared formatDate() helper both expect a
   plain yyyy-mm-dd string.
===================================================== */

function toDateInputValue(value) {
  if (!value) return "";
  return String(value).split("T")[0];
}

/* =====================================================
   ADAPT LEGACY DEMO DATA
   Used only when there's no backend connection / no admin
   token yet, so the page still has something to show.
===================================================== */

function adaptSeedDrive(drive) {
  return {
    _id: drive.id,
    id: drive.id,
    role: drive.role,
    company: drive.company,
    type: "Internship",
    location: drive.location,
    stipend: drive.package,
    eligibility: drive.eligibility,
    deadline: drive.deadline,
    description: drive.desc,
    skills: [],
    logo: "💼",
    status: drive.status === "Closed" ? "Closed" : "Active",
    applicantCount: drive.applicants,
  };
}

const demoPlacements = seedDrives.map(adaptSeedDrive);

/* =====================================================
   DRIVE FORM
===================================================== */

function DriveForm({ initial, onCancel, onSubmit }) {
  const [form, setForm] = useState(
    initial || {
      company: "",
      role: "",
      type: "Internship",
      description: "",
      stipend: "",
      location: "",
      deadline: "",
      eligibility: "",
      skills: "",
      logo: "💼",
      status: "Active",
    }
  );
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!form.company.trim() || !form.role.trim() || !form.deadline) return;
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
        <Field label="Type">
          <Select value={form.type} onChange={set("type")}>
            {PLACEMENT_TYPES.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </Select>
        </Field>
        <Field label="Status">
          <Select value={form.status} onChange={set("status")}>
            <option value="Active">Active</option>
            <option value="Closed">Closed</option>
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Stipend / CTC">
          <input className={inputCls} value={form.stipend} onChange={set("stipend")} placeholder="₹12 LPA or ₹40k/month" />
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
      <Field label="Skills (comma separated)">
        <input className={inputCls} value={form.skills} onChange={set("skills")} placeholder="e.g. React, Node.js, SQL" />
      </Field>
      <Field label="Description">
        <textarea
          className={textareaCls + " min-h-[70px]"}
          value={form.description}
          onChange={set("description")}
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

/* =====================================================
   PLACEMENTS PAGE
===================================================== */

export default function Placements({ notify }) {
  const [drives, setDrives] = useState(demoPlacements);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =====================================================
     GET ALL PLACEMENTS
  ===================================================== */

  const fetchPlacements = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) {
        console.error(data.message || "Failed to fetch placements");
        setDrives(demoPlacements);
        return;
      }

      const formatted = (data.placements || []).map((placement) => ({
        ...placement,
        id: placement._id || placement.id,
      }));

      setDrives(formatted.length ? formatted : demoPlacements);
    } catch (error) {
      console.error("Fetch placements error:", error);
      setDrives(demoPlacements);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacements();
  }, []);

  const stats = useMemo(
    () => ({
      total: drives.length,
      active: drives.filter((d) => d.status === "Active").length,
      closed: drives.filter((d) => d.status === "Closed").length,
      applicants: drives.reduce((s, d) => s + Number(d.applicantCount || 0), 0),
    }),
    [drives]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return drives;
    return drives.filter((d) => [d.company, d.role, d.location, d.type].join(" ").toLowerCase().includes(q));
  }, [drives, query]);

  /* =====================================================
     CREATE PLACEMENT
  ===================================================== */

  const handleCreate = async (form) => {
    try {
      const token = localStorage.getItem("adminToken");

      const payload = {
        role: form.role.trim(),
        company: form.company.trim(),
        type: form.type,
        location: form.location.trim(),
        stipend: form.stipend.trim(),
        eligibility: form.eligibility.trim(),
        deadline: form.deadline,
        description: form.description.trim(),
        skills: form.skills,
        logo: form.logo || "💼",
        status: form.status,
      };

      if (!token) {
        const newDrive = {
          ...payload,
          _id: `demo-${Date.now()}`,
          id: `demo-${Date.now()}`,
          skills: form.skills
            ? form.skills.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
          applicantCount: 0,
        };
        setDrives((previous) => [newDrive, ...previous]);
        setModal(null);
        notify?.({ title: "Drive published", subtitle: form.company });
        return;
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to create placement");
        return;
      }

      const newDrive = { ...data.placement, id: data.placement._id };

      setDrives((previous) => [newDrive, ...previous]);
      setModal(null);
      notify?.({ title: "Drive published", subtitle: form.company });
    } catch (error) {
      console.error("Create placement error:", error);
      alert("Cannot connect to backend.");
    }
  };

  /* =====================================================
     UPDATE PLACEMENT
  ===================================================== */

  const handleEdit = async (form) => {
    try {
      const token = localStorage.getItem("adminToken");
      const targetId = modal.drive._id || modal.drive.id;

      const payload = {
        role: form.role.trim(),
        company: form.company.trim(),
        type: form.type,
        location: form.location.trim(),
        stipend: form.stipend.trim(),
        eligibility: form.eligibility.trim(),
        deadline: form.deadline,
        description: form.description.trim(),
        skills: form.skills,
        logo: form.logo || "💼",
        status: form.status,
      };

      if (!token) {
        setDrives((previous) =>
          previous.map((d) =>
            (d._id || d.id) === targetId
              ? {
                  ...d,
                  ...payload,
                  skills: form.skills
                    ? form.skills.split(",").map((s) => s.trim()).filter(Boolean)
                    : [],
                }
              : d
          )
        );
        setModal(null);
        notify?.({ title: "Drive updated", subtitle: form.company });
        return;
      }

      const response = await fetch(`${API_URL}/${targetId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to update placement");
        return;
      }

      const updatedDrive = { ...data.placement, id: data.placement._id };

      setDrives((previous) =>
        previous.map((d) => ((d._id || d.id) === updatedDrive.id ? updatedDrive : d))
      );

      setModal(null);
      notify?.({ title: "Drive updated", subtitle: form.company });
    } catch (error) {
      console.error("Update placement error:", error);
      alert("Cannot connect to backend.");
    }
  };

  /* =====================================================
     DELETE PLACEMENT
  ===================================================== */

  const handleDelete = async (drive) => {
    try {
      const token = localStorage.getItem("adminToken");
      const targetId = drive._id || drive.id;

      if (!token) {
        setDrives((previous) => previous.filter((d) => (d._id || d.id) !== targetId));
        notify?.({ title: "Drive deleted", subtitle: drive.company });
        return;
      }

      const response = await fetch(`${API_URL}/${targetId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete placement");
        return;
      }

      setDrives((previous) => previous.filter((d) => (d._id || d.id) !== targetId));
      notify?.({ title: "Drive deleted", subtitle: drive.company });
    } catch (error) {
      console.error("Delete placement error:", error);
      alert("Cannot connect to backend.");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await handleDelete(deleteTarget);
    setDeleteTarget(null);
  };

  /* =====================================================
     TOGGLE STATUS (Active <-> Closed)
  ===================================================== */

  const cycleStatus = async (drive) => {
    const nextStatus = drive.status === "Active" ? "Closed" : "Active";
    const targetId = drive._id || drive.id;

    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        setDrives((previous) => previous.map((d) => ((d._id || d.id) === targetId ? { ...d, status: nextStatus } : d)));
        notify?.({ title: "Status updated", subtitle: `${drive.company} \u2014 ${nextStatus}` });
        return;
      }

      const response = await fetch(`${API_URL}/${targetId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to update status");
        return;
      }

      setDrives((previous) => previous.map((d) => ((d._id || d.id) === targetId ? { ...d, status: nextStatus } : d)));
      notify?.({ title: "Status updated", subtitle: `${drive.company} \u2014 ${nextStatus}` });
    } catch (error) {
      console.error("Update status error:", error);
      alert("Cannot connect to backend.");
    }
  };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div>
      <SectionHeader
        title="Placements Management"
        subtitle="Publish drives, track applicants and manage deadlines."
        action={{ label: "New drive", icon: <Plus size={16} />, onClick: () => setModal({ mode: "create" }) }}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
        <StatCard icon={Briefcase} label="Total drives" value={stats.total} tint="bg-blue-50 text-blue-600" />
        <StatCard icon={CheckCircle2} label="Active" value={stats.active} tint="bg-emerald-50 text-emerald-600" />
        <StatCard icon={XCircle} label="Closed" value={stats.closed} tint="bg-slate-100 text-slate-500" />
        <StatCard icon={Users} label="Total applicants" value={stats.applicants} tint="bg-blue-50 text-blue-600" />
      </div>

      <div className={`rounded-2xl border border-slate-100 bg-white ${cardShadowCls} mt-6 overflow-hidden`}>
        <div className="p-5">
          <SearchBar value={query} onChange={setQuery} placeholder="Search drives..." />
        </div>

        {loading && (
          <div className="pb-8 text-center text-slate-500">
            Loading placements...
          </div>
        )}

        {!loading && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-y border-slate-200">
                  <th className="px-5 py-3 font-medium">Company</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Stipend / CTC</th>
                  <th className="px-5 py-3 font-medium">Location</th>
                  <th className="px-5 py-3 font-medium">Deadline</th>
                  <th className="px-5 py-3 font-medium">Applicants</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d._id || d.id} className="border-b border-slate-200 last:border-0">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-sm">
                          {d.logo || "💼"}
                        </div>
                        <span className="font-medium text-slate-800">{d.company}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{d.role}</td>
                    <td className="px-5 py-3 text-slate-600">{d.type}</td>
                    <td className="px-5 py-3 text-slate-600">{d.stipend || "\u2014"}</td>
                    <td className="px-5 py-3 text-slate-600">{d.location || "\u2014"}</td>
                    <td className="px-5 py-3 text-slate-600">{formatDate(toDateInputValue(d.deadline))}</td>
                    <td className="px-5 py-3 text-slate-600">{d.applicantCount || 0}</td>
                    <td className="px-5 py-3">
                      <button
                        type="button"
                        onClick={() => cycleStatus(d)}
                        title="Click to toggle status"
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer hover:opacity-80 transition-opacity ${
                          PLACEMENT_STATUS_STYLES[d.status] || ""
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${d.status === "Active" ? "bg-emerald-500" : "bg-slate-400"}`}
                        />
                        {d.status}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() =>
                            setModal({
                              mode: "edit",
                              drive: { ...d, deadline: toDateInputValue(d.deadline), skills: (d.skills || []).join(", ") },
                            })
                          }
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
                    <td colSpan={9} className="px-5 py-10 text-center text-slate-400">
                      No drives match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
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
