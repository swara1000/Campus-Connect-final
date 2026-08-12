import React, { useMemo, useState } from "react";
import { Users, UserRound, Pencil, Trash2, Plus } from "lucide-react";
import { SectionHeader, SearchBar, Modal, Field, Select, EmptyState, ConfirmDialog, PersonListModal } from "./Shared";
import { seedClubs, seedStudents, CATEGORY_COLORS } from "../data/mockData";
import { initials, inputCls, textareaCls, rosterFor, cardShadowCls, secondaryBtnCls, primaryBtnCls } from "../utils";
import { uid } from "../utils";

function AssignCoordinatorForm({ initial, onCancel, onSubmit }) {
  const [name, setName] = useState(initial || "");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSubmit(name.trim());
      }}
    >
      <Field label="Coordinator name">
        <input
          className={inputCls}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Dr. Anil Mehta"
          autoFocus
          required
        />
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className={secondaryBtnCls}>
          Cancel
        </button>
        <button type="submit" className={primaryBtnCls}>
          Assign
        </button>
      </div>
    </form>
  );
}

function ClubForm({ initial, onCancel, onSubmit }) {
  const [form, setForm] = useState(
    initial || { name: "", category: "", desc: "", coordinator: "", members: 0 }
  );
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.category) return;
        onSubmit(form);
      }}
    >
      <Field label="Club name">
        <input className={inputCls} value={form.name} onChange={set("name")} placeholder="e.g. Film Society" required />
      </Field>
      <Field label="Category">
        <Select value={form.category} onChange={set("category")} required>
          <option value="" disabled>
            Select category
          </option>
          {Object.keys(CATEGORY_COLORS).map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Description">
        <textarea className={textareaCls + " min-h-[70px]"} value={form.desc} onChange={set("desc")} placeholder="What this club does" />
      </Field>
      <Field label="Coordinator">
        <input className={inputCls} value={form.coordinator} onChange={set("coordinator")} placeholder="Faculty coordinator name" />
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className={secondaryBtnCls}>
          Cancel
        </button>
        <button type="submit" className={primaryBtnCls}>
          {initial ? "Save changes" : "Create club"}
        </button>
      </div>
    </form>
  );
}

export default function Clubs({ notify }) {
  const [clubs, setClubs] = useState(seedClubs);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null); // { mode: 'create'|'edit', club }
  const [membersClub, setMembersClub] = useState(null);
  const [coordinatorClub, setCoordinatorClub] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clubs;
    return clubs.filter((c) =>
      [c.name, c.category, c.coordinator].join(" ").toLowerCase().includes(q)
    );
  }, [clubs, query]);

  const handleCreate = (form) => {
    setClubs([{ ...form, id: uid("c"), members: Number(form.members) || 0, created: "Aug 8, 2026" }, ...clubs]);
    setModal(null);
    notify({ title: "Club created", subtitle: form.name });
  };

  const handleEdit = (form) => {
    setClubs(clubs.map((c) => (c.id === modal.club.id ? { ...c, ...form } : c)));
    setModal(null);
    notify({ title: "Club updated", subtitle: form.name });
  };

  const handleDelete = (club) => {
    setClubs(clubs.filter((c) => c.id !== club.id));
    notify({ title: "Club deleted", subtitle: club.name });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    handleDelete(deleteTarget);
    setDeleteTarget(null);
  };

  const handleAssignCoordinator = (name) => {
    setClubs(clubs.map((c) => (c.id === coordinatorClub.id ? { ...c, coordinator: name } : c)));
    notify({ title: "Coordinator assigned", subtitle: `${name} \u2192 ${coordinatorClub.name}` });
    setCoordinatorClub(null);
  };

  return (
    <div>
      <SectionHeader
        title="Clubs"
        subtitle={`${clubs.length} active club${clubs.length === 1 ? "" : "s"} and societies`}
        action={{ label: "Create club", icon: <Plus size={16} />, onClick: () => setModal({ mode: "create" }) }}
      />
      <SearchBar value={query} onChange={setQuery} placeholder="Search clubs, categories or coordinators..." className="mt-5" />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mt-5">
        {filtered.map((club) => (
          <div key={club.id} className={`rounded-2xl border border-slate-100 bg-white ${cardShadowCls} p-5 flex flex-col`}>
            <div className="flex items-start justify-between">
              <div className="h-11 w-11 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-semibold text-sm">
                {initials(club.name)}
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${CATEGORY_COLORS[club.category] || "bg-slate-100 text-slate-600"}`}>
                {club.category}
              </span>
            </div>
            <h3 className="font-semibold text-slate-900 mt-3">{club.name}</h3>
            <p className="text-sm text-slate-500 mt-1 flex-1">{club.desc}</p>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-xs text-slate-500">Members</p>
                <p className="text-sm font-semibold text-slate-800">{club.members}</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-xs text-slate-500">Created</p>
                <p className="text-sm font-semibold text-slate-800">{club.created}</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-3">
              Coordinator: <span className="text-slate-700 font-medium">{club.coordinator || "\u2014"}</span>
            </p>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200">
              <button
                onClick={() => setMembersClub(club)}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full px-3 py-1.5"
              >
                <Users size={14} /> Members
              </button>
              <button
                onClick={() => setCoordinatorClub(club)}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full px-3 py-1.5"
              >
                <UserRound size={14} /> Coordinator
              </button>
              <div className="flex-1" />
              <button
                onClick={() => setModal({ mode: "edit", club })}
                className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full p-1.5 transition-colors"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => setDeleteTarget(club)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-1.5 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <EmptyState text="No clubs match your search." />}
      </div>

      {modal && (
        <Modal
          title={modal.mode === "create" ? "Create club" : "Edit club"}
          subtitle={modal.mode === "create" ? "Add a new club or society." : modal.club.name}
          onClose={() => setModal(null)}
        >
          <ClubForm
            initial={modal.mode === "edit" ? modal.club : null}
            onCancel={() => setModal(null)}
            onSubmit={modal.mode === "create" ? handleCreate : handleEdit}
          />
        </Modal>
      )}

      {membersClub && (
        <PersonListModal
          title={`${membersClub.name} members`}
          subtitle={`${membersClub.members} students enrolled in this club.`}
          people={rosterFor(seedStudents, membersClub.id, membersClub.members)}
          meta={(p) => `${p.department} \u00b7 ${p.year}`}
          onClose={() => setMembersClub(null)}
        />
      )}

      {coordinatorClub && (
        <Modal title="Assign coordinator" subtitle={coordinatorClub.name} onClose={() => setCoordinatorClub(null)}>
          <AssignCoordinatorForm
            initial={coordinatorClub.coordinator}
            onCancel={() => setCoordinatorClub(null)}
            onSubmit={handleAssignCoordinator}
          />
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this club?"
          message={`"${deleteTarget.name}" and its membership records will be permanently removed. This can't be undone.`}
          confirmLabel="Delete club"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
