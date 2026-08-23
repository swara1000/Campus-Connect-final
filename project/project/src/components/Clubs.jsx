import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Users,
  UserRound,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";

import {
  SectionHeader,
  SearchBar,
  Modal,
  Field,
  Select,
  EmptyState,
  ConfirmDialog,
  PersonListModal,
} from "./Shared";

import {
  CATEGORY_COLORS,
  seedClubs,
} from "../data/mockData";

import {
  initials,
  inputCls,
  textareaCls,
  cardShadowCls,
  secondaryBtnCls,
  primaryBtnCls,
} from "../utils";

const API_URL =
  "http://localhost:5000/api/clubs";

/* =====================================================
   COORDINATOR FORM
===================================================== */

function AssignCoordinatorForm({
  initial,
  onCancel,
  onSubmit,
}) {
  const [name, setName] =
    useState(initial || "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        if (!name.trim()) {
          return;
        }

        onSubmit(name.trim());
      }}
    >
      <Field label="Coordinator name">
        <input
          className={inputCls}
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          placeholder="e.g. Dr. Anil Mehta"
          autoFocus
          required
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

        <button
          type="submit"
          className={primaryBtnCls}
        >
          Assign
        </button>
      </div>
    </form>
  );
}

/* =====================================================
   CLUB FORM
===================================================== */

function ClubForm({
  initial,
  onCancel,
  onSubmit,
}) {
  const [form, setForm] =
    useState(
      initial || {
        name: "",
        category: "",
        desc: "",
        coordinator: "",
        status: "Active",
      }
    );

  const set = (key) => (e) => {
    setForm({
      ...form,
      [key]: e.target.value,
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        if (
          !form.name.trim() ||
          !form.category
        ) {
          return;
        }

        onSubmit(form);
      }}
    >
      <Field label="Club name">
        <input
          className={inputCls}
          value={form.name}
          onChange={set("name")}
          placeholder="e.g. Film Society"
          required
        />
      </Field>

      <Field label="Category">
        <Select
          value={form.category}
          onChange={set("category")}
          required
        >
          <option
            value=""
            disabled
          >
            Select category
          </option>

          {Object.keys(
            CATEGORY_COLORS
          ).map((category) => (
            <option
              key={category}
              value={category}
            >
              {category}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Description">
        <textarea
          className={
            textareaCls +
            " min-h-[70px]"
          }
          value={form.desc}
          onChange={set("desc")}
          placeholder="What this club does"
        />
      </Field>

      <Field label="Coordinator">
        <input
          className={inputCls}
          value={form.coordinator}
          onChange={set(
            "coordinator"
          )}
          placeholder="Faculty coordinator name"
        />
      </Field>

      <Field label="Status">
        <Select
          value={
            form.status ||
            "Active"
          }
          onChange={set("status")}
        >
          <option value="Active">
            Active
          </option>

          <option value="Inactive">
            Inactive
          </option>
        </Select>
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className={secondaryBtnCls}
        >
          Cancel
        </button>

        <button
          type="submit"
          className={primaryBtnCls}
        >
          {initial
            ? "Save changes"
            : "Create club"}
        </button>
      </div>
    </form>
  );
}

/* =====================================================
   CLUBS PAGE
===================================================== */

export default function Clubs({
  notify,
}) {
  const [clubs, setClubs] =
    useState(
      seedClubs.map((club) => ({
        ...club,
        id: club.id || club._id,
        desc: club.desc || club.description || "",
        coordinator: club.coordinator || club.president || "",
        members: club.members || club.membersCount || 0,
        created: club.created || "",
      }))
    );

  const [query, setQuery] =
    useState("");

  const [modal, setModal] =
    useState(null);

  const [
    membersClub,
    setMembersClub,
  ] = useState(null);

  const [
    clubMembers,
    setClubMembers,
  ] = useState([]);

  const [
    membersLoading,
    setMembersLoading,
  ] = useState(false);

  const [
    coordinatorClub,
    setCoordinatorClub,
  ] = useState(null);

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  /* =====================================================
     FETCH CLUBS
  ===================================================== */

  const fetchClubs = async () => {
    try {
      setLoading(true);

      const response =
        await fetch(API_URL);

      const data =
        await response.json();

      if (!response.ok) {
        console.error(
          data.message ||
            "Failed to fetch clubs"
        );
        setClubs(
          seedClubs.map((club) => ({
            ...club,
            id: club.id || club._id,
            desc: club.desc || club.description || "",
            coordinator: club.coordinator || club.president || "",
            members: club.members || club.membersCount || 0,
            created: club.created || "",
          }))
        );
        return;
      }

      const formattedClubs =
        (data.clubs || []).map(
          (club) => ({
            ...club,
            id: club._id || club.id,
            desc: club.description || "",
            coordinator: club.president || "",
            members: club.membersCount || 0,
            created: club.createdAt ? new Date(club.createdAt).toLocaleDateString() : "",
          })
        );

      setClubs(
        formattedClubs.length
          ? formattedClubs
          : seedClubs.map((club) => ({
              ...club,
              id: club.id || club._id,
              desc: club.desc || club.description || "",
              coordinator: club.coordinator || club.president || "",
              members: club.members || club.membersCount || 0,
              created: club.created || "",
            }))
      );
    } catch (error) {
      console.error(
        "Fetch clubs error:",
        error
      );
      setClubs(
        seedClubs.map((club) => ({
          ...club,
          id: club.id || club._id,
          desc: club.desc || club.description || "",
          coordinator: club.coordinator || club.president || "",
          members: club.members || club.membersCount || 0,
          created: club.created || "",
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  /* =====================================================
     FILTER
  ===================================================== */

  const filtered =
    useMemo(() => {
      const q = query
        .trim()
        .toLowerCase();

      if (!q) {
        return clubs;
      }

      return clubs.filter(
        (club) =>
          [
            club.name,
            club.category,
            club.coordinator,
          ]
            .join(" ")
            .toLowerCase()
            .includes(q)
      );
    }, [clubs, query]);

  /* =====================================================
     CREATE CLUB
  ===================================================== */

  const handleCreate =
    async (form) => {
      try {
        const token =
          localStorage.getItem(
            "adminToken"
          );

        if (!token) {
          const newClub = {
            ...form,
            id: `demo-club-${Date.now()}`,
            _id: `demo-club-${Date.now()}`,
            name: form.name.trim(),
            category: form.category,
            desc: form.desc,
            coordinator: form.coordinator,
            members: 0,
            created: new Date().toLocaleDateString(),
            status: form.status || "Active",
          };

          setClubs((previous) => [newClub, ...previous]);
          setModal(null);
          notify?.({ title: "Club created", subtitle: form.name });
          return;
        }

        const response =
          await fetch(
            API_URL,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                name:
                  form.name.trim(),

                category:
                  form.category,

                description:
                  form.desc,

                president:
                  form.coordinator,

                status:
                  form.status ||
                  "Active",
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          alert(
            data.message ||
              "Failed to create club"
          );

          return;
        }

        const newClub = {
          ...data.club,

          id:
            data.club._id,

          desc:
            data.club
              .description ||
            "",

          coordinator:
            data.club
              .president ||
            "",

          members:
            data.club
              .membersCount ||
            0,

          created:
            data.club.createdAt
              ? new Date(
                  data.club.createdAt
                ).toLocaleDateString()
              : "",
        };

        setClubs(
          (previous) => [
            newClub,
            ...previous,
          ]
        );

        setModal(null);

        if (notify) {
          notify({
            title:
              "Club created",

            subtitle:
              form.name,
          });
        }
      } catch (error) {
        console.error(
          "Create club error:",
          error
        );

        alert(
          "Cannot connect to backend."
        );
      }
    };

  /* =====================================================
     UPDATE CLUB
  ===================================================== */

  const handleEdit =
    async (form) => {
      try {
        const token =
          localStorage.getItem(
            "adminToken"
          );

        if (!token) {
          setClubs((previous) =>
            previous.map((club) =>
              (club._id || club.id) === (modal.club._id || modal.club.id)
                ? {
                    ...club,
                    name: form.name.trim(),
                    category: form.category,
                    desc: form.desc,
                    coordinator: form.coordinator,
                    status: form.status || "Active",
                  }
                : club
            )
          );
          setModal(null);
          notify?.({ title: "Club updated", subtitle: form.name });
          return;
        }

        const clubId =
          modal.club._id ||
          modal.club.id;

        const response =
          await fetch(
            `${API_URL}/${clubId}`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                name:
                  form.name.trim(),

                category:
                  form.category,

                description:
                  form.desc,

                president:
                  form.coordinator,

                status:
                  form.status ||
                  "Active",
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          alert(
            data.message ||
              "Failed to update club"
          );

          return;
        }

        const updatedClub = {
          ...data.club,

          id:
            data.club._id,

          desc:
            data.club
              .description ||
            "",

          coordinator:
            data.club
              .president ||
            "",

          members:
            data.club
              .membersCount ||
            0,

          created:
            data.club.createdAt
              ? new Date(
                  data.club.createdAt
                ).toLocaleDateString()
              : "",
        };

        setClubs(
          (previous) =>
            previous.map(
              (club) =>
                club._id ===
                data.club._id
                  ? updatedClub
                  : club
            )
        );

        setModal(null);

        if (notify) {
          notify({
            title:
              "Club updated",

            subtitle:
              form.name,
          });
        }
      } catch (error) {
        console.error(
          "Update club error:",
          error
        );

        alert(
          "Cannot connect to backend."
        );
      }
    };

  /* =====================================================
     DELETE CLUB
  ===================================================== */

  const handleDelete =
    async (club) => {
      try {
        const token =
          localStorage.getItem(
            "adminToken"
          );

        if (!token) {
          setClubs((previous) => previous.filter((item) => (item._id || item.id) !== (club._id || club.id)));
          setDeleteTarget(null);
          notify?.({ title: "Club deleted", subtitle: club.name });
          return;
        }

        const clubId =
          club._id ||
          club.id;

        const response =
          await fetch(
            `${API_URL}/${clubId}`,
            {
              method:
                "DELETE",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          alert(
            data.message ||
              "Failed to delete club"
          );

          return;
        }

        setClubs(
          (previous) =>
            previous.filter(
              (item) =>
                item._id !==
                clubId
            )
        );

        if (notify) {
          notify({
            title:
              "Club deleted",

            subtitle:
              club.name,
          });
        }
      } catch (error) {
        console.error(
          "Delete club error:",
          error
        );

        alert(
          "Cannot connect to backend."
        );
      }
    };

  const confirmDelete =
    async () => {
      if (!deleteTarget) {
        return;
      }

      await handleDelete(
        deleteTarget
      );

      setDeleteTarget(null);
    };

  /* =====================================================
     ASSIGN COORDINATOR
  ===================================================== */

  const handleAssignCoordinator =
    async (name) => {
      try {
        const token =
          localStorage.getItem(
            "adminToken"
          );

        if (!token) {
          alert(
            "Admin token not found. Please login again."
          );
          return;
        }

        const clubId =
          coordinatorClub._id ||
          coordinatorClub.id;

        const response =
          await fetch(
            `${API_URL}/${clubId}`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                president:
                  name,
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          alert(
            data.message ||
              "Failed to assign coordinator"
          );

          return;
        }

        setClubs(
          (previous) =>
            previous.map(
              (club) =>
                club._id ===
                data.club._id
                  ? {
                      ...club,

                      president:
                        data.club
                          .president,

                      coordinator:
                        data.club
                          .president,
                    }
                  : club
            )
        );

        if (notify) {
          notify({
            title:
              "Coordinator assigned",

            subtitle:
              `${name} → ${coordinatorClub.name}`,
          });
        }

        setCoordinatorClub(
          null
        );
      } catch (error) {
        console.error(
          "Coordinator error:",
          error
        );

        alert(
          "Cannot connect to backend."
        );
      }
    };

  /* =====================================================
     GET REAL CLUB MEMBERS
  ===================================================== */

  const handleOpenMembers =
    async (club) => {
      try {
        const token =
          localStorage.getItem(
            "adminToken"
          );

        if (!token) {
          alert(
            "Admin token not found. Please login again."
          );
          return;
        }

        const clubId =
          club._id ||
          club.id;

        setMembersLoading(
          true
        );

        setMembersClub(
          club
        );

        setClubMembers([]);

        const response =
          await fetch(
            `${API_URL}/${clubId}/members`,
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          alert(
            data.message ||
              "Failed to fetch club members"
          );

          setMembersClub(
            null
          );

          return;
        }

        const people =
          (data.memberships || [])
            .filter(
              (membership) =>
                membership.student
            )
            .map(
              (membership) => ({
                id:
                  membership.student
                    ._id,

                name:
                  membership.student
                    .name ||
                  "Student",

                email:
                  membership.student
                    .email ||
                  "",

                department:
                  membership.student
                    .department ||
                  membership.student
                    .major ||
                  "",

                year:
                  membership.student
                    .year ||
                  "",

                initials:
                  membership.student
                    .initials ||
                  initials(
                    membership.student
                      .name ||
                      "Student"
                  ),
              })
            );

        setClubMembers(
          people
        );

        setClubs(
          (previous) =>
            previous.map(
              (item) =>
                item.id ===
                  clubId ||
                item._id ===
                  clubId
                  ? {
                      ...item,

                      members:
                        data.count ??
                        people.length,

                      membersCount:
                        data.count ??
                        people.length,
                    }
                  : item
            )
        );
      } catch (error) {
        console.error(
          "Fetch club members error:",
          error
        );

        alert(
          "Cannot connect to backend."
        );

        setMembersClub(
          null
        );
      } finally {
        setMembersLoading(
          false
        );
      }
    };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div>
      <SectionHeader
        title="Clubs"
        subtitle={`${clubs.length} active club${
          clubs.length === 1
            ? ""
            : "s"
        } and societies`}
        action={{
          label: "Create club",

          icon: (
            <Plus size={16} />
          ),

          onClick: () =>
            setModal({
              mode: "create",
            }),
        }}
      />

      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search clubs, categories or coordinators..."
        className="mt-5"
      />

      {loading && (
        <div className="mt-8 text-center text-slate-500">
          Loading clubs...
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mt-5">
          {filtered.map(
            (club) => (
              <div
                key={
                  club._id ||
                  club.id
                }
                className={`rounded-2xl border border-slate-100 bg-white ${cardShadowCls} p-5 flex flex-col`}
              >
                <div className="flex items-start justify-between">
                  <div className="h-11 w-11 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-semibold text-sm">
                    {initials(
                      club.name
                    )}
                  </div>

                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      CATEGORY_COLORS[
                        club.category
                      ] ||
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {
                      club.category
                    }
                  </span>
                </div>

                <h3 className="font-semibold text-slate-900 mt-3">
                  {club.name}
                </h3>

                <p className="text-sm text-slate-500 mt-1 flex-1">
                  {club.desc}
                </p>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="rounded-lg bg-slate-50 px-3 py-2">
                    <p className="text-xs text-slate-500">
                      Members
                    </p>

                    <p className="text-sm font-semibold text-slate-800">
                      {club.members}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 px-3 py-2">
                    <p className="text-xs text-slate-500">
                      Created
                    </p>

                    <p className="text-sm font-semibold text-slate-800">
                      {club.created}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-slate-500 mt-3">
                  Coordinator:{" "}

                  <span className="text-slate-700 font-medium">
                    {club.coordinator ||
                      "—"}
                  </span>
                </p>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200">
                  <button
                    onClick={() =>
                      handleOpenMembers(
                        club
                      )
                    }
                    className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full px-3 py-1.5"
                  >
                    <Users size={14} />

                    Members
                  </button>

                  <button
                    onClick={() =>
                      setCoordinatorClub(
                        club
                      )
                    }
                    className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full px-3 py-1.5"
                  >
                    <UserRound
                      size={14}
                    />

                    Coordinator
                  </button>

                  <div className="flex-1" />

                  <button
                    onClick={() =>
                      setModal({
                        mode: "edit",
                        club,
                      })
                    }
                    className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full p-1.5 transition-colors"
                  >
                    <Pencil
                      size={16}
                    />
                  </button>

                  <button
                    onClick={() =>
                      setDeleteTarget(
                        club
                      )
                    }
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-1.5 transition-colors"
                  >
                    <Trash2
                      size={16}
                    />
                  </button>
                </div>
              </div>
            )
          )}

          {filtered.length ===
            0 && (
            <EmptyState text="No clubs match your search." />
          )}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}

      {modal && (
        <Modal
          title={
            modal.mode ===
            "create"
              ? "Create club"
              : "Edit club"
          }
          subtitle={
            modal.mode ===
            "create"
              ? "Add a new club or society."
              : modal.club
                  .name
          }
          onClose={() =>
            setModal(null)
          }
        >
          <ClubForm
            initial={
              modal.mode ===
              "edit"
                ? modal.club
                : null
            }
            onCancel={() =>
              setModal(null)
            }
            onSubmit={
              modal.mode ===
              "create"
                ? handleCreate
                : handleEdit
            }
          />
        </Modal>
      )}

      {/* REAL MEMBERS MODAL */}

      {membersClub && (
        <PersonListModal
          title={`${membersClub.name} members`}
          subtitle={
            membersLoading
              ? "Loading members..."
              : `${clubMembers.length} student${
                  clubMembers.length ===
                  1
                    ? ""
                    : "s"
                } enrolled in this club.`
          }
          people={
            membersLoading
              ? []
              : clubMembers
          }
          meta={(person) => {
            const details = [
              person.email,
              person.department,
              person.year,
            ].filter(Boolean);

            return (
              details.join(
                " · "
              ) ||
              "Student"
            );
          }}
          onClose={() => {
            setMembersClub(
              null
            );

            setClubMembers(
              []
            );
          }}
        />
      )}

      {/* COORDINATOR MODAL */}

      {coordinatorClub && (
        <Modal
          title="Assign coordinator"
          subtitle={
            coordinatorClub.name
          }
          onClose={() =>
            setCoordinatorClub(
              null
            )
          }
        >
          <AssignCoordinatorForm
            initial={
              coordinatorClub.coordinator
            }
            onCancel={() =>
              setCoordinatorClub(
                null
              )
            }
            onSubmit={
              handleAssignCoordinator
            }
          />
        </Modal>
      )}

      {/* DELETE CONFIRMATION */}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this club?"
          message={`"${deleteTarget.name}" and its membership records will be permanently removed. This can't be undone.`}
          confirmLabel="Delete club"
          onCancel={() =>
            setDeleteTarget(
              null
            )
          }
          onConfirm={
            confirmDelete
          }
        />
      )}
    </div>
  );
}