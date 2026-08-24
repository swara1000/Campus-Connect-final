import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Briefcase,
  MapPin,
  Users,
  CalendarClock,
  X,
} from "lucide-react";

import { toast } from "sonner";

import { AppShell, GlassCard } from "@/components/AppShell";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "../lib/api-config.js";

export const Route = createFileRoute("/admin/placements")({
  head: () => ({
    meta: [
      {
        title: "Manage Placements — CampusConnect",
      },
      {
        name: "description",
        content: "Post and manage placement and internship opportunities.",
      },
    ],
  }),

  component: ManagePlacements,
});

const API_URL = `${API_BASE_URL}/api/placements`;

/* =====================================================
   DATE HELPERS
===================================================== */

// Convert DD-MM-YYYY -> YYYY-MM-DD
function convertDisplayDateToApi(value) {
  const cleaned = String(value || "").trim();

  if (!cleaned) return "";

  const match = cleaned.match(/^(\d{2})-(\d{2})-(\d{4})$/);

  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  const testDate = new Date(year, month - 1, day);

  if (
    testDate.getFullYear() !== year ||
    testDate.getMonth() !== month - 1 ||
    testDate.getDate() !== day
  ) {
    return null;
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// Convert YYYY-MM-DD (or ISO) -> DD-MM-YYYY
function convertApiDateToDisplay(value) {
  if (!value) return "";

  const cleaned = String(value).split("T")[0];
  const match = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) return "";

  return `${match[3]}-${match[2]}-${match[1]}`;
}

function formatDate(value) {
  if (!value) return "No deadline set";

  const cleaned = String(value).split("T")[0];
  const match = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (match) return `${match[3]}-${match[2]}-${match[1]}`;

  return String(value);
}

/* =====================================================
   DEFAULT FORM
===================================================== */

const emptyForm = {
  role: "",
  company: "",
  type: "Internship",
  location: "",
  stipend: "",
  eligibility: "",
  deadline: "",
  description: "",
  skills: "",
  logo: "💼",
  status: "Active",
};

const placementTypes = ["Internship", "Full-time", "Job Drive"];

/* =====================================================
   COMPONENT
===================================================== */

function ManagePlacements() {
  const [placements, setPlacements] = useState([]);
  const [query, setQuery] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const getToken = () => localStorage.getItem("campusconnect_token");

  /* ===================================================
     LOAD PLACEMENTS
  =================================================== */

  const loadPlacements = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to load placements");
      }

      setPlacements(Array.isArray(data?.placements) ? data.placements : []);
    } catch (error) {
      console.error("Load placements error:", error);
      toast.error(error?.message || "Failed to load placements");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlacements();
  }, [loadPlacements]);

  /* ===================================================
     FILTER
  =================================================== */

  const filteredPlacements = useMemo(() => {
    const value = query.trim().toLowerCase();

    if (!value) return placements;

    return placements.filter((p) =>
      [p?.role, p?.company, p?.location, p?.type, p?.status]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(value)
    );
  }, [placements, query]);

  /* ===================================================
     MODAL HELPERS
  =================================================== */

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  const openEditModal = (placement) => {
    setEditingId(placement?._id || null);

    setForm({
      role: placement?.role || "",
      company: placement?.company || "",
      type: placement?.type || "Internship",
      location: placement?.location || "",
      stipend: placement?.stipend || "",
      eligibility: placement?.eligibility || "",
      deadline: convertApiDateToDisplay(placement?.deadline),
      description: placement?.description || "",
      skills: (placement?.skills || []).join(", "),
      logo: placement?.logo || "💼",
      status: placement?.status || "Active",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setForm({ ...emptyForm });
  };

  const updateField = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  /* ===================================================
     SAVE
  =================================================== */

  const savePlacement = async () => {
    const token = getToken();

    if (!token) {
      toast.error("Please login as admin.");
      return;
    }

    const role = form.role.trim();
    const company = form.company.trim();

    if (!role || !company) {
      toast.error("Role and company are required.");
      return;
    }

    const apiDeadline = convertDisplayDateToApi(form.deadline);

    if (apiDeadline === null) {
      toast.error("Enter a valid deadline in DD-MM-YYYY format.");
      return;
    }

    if (!apiDeadline) {
      toast.error("Deadline is required.");
      return;
    }

    try {
      setSaving(true);

      const editing = Boolean(editingId);
      const url = editing ? `${API_URL}/${editingId}` : API_URL;
      const method = editing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role,
          company,
          type: form.type,
          location: form.location.trim(),
          stipend: form.stipend.trim(),
          eligibility: form.eligibility.trim(),
          deadline: apiDeadline,
          description: form.description.trim(),
          skills: form.skills,
          logo: form.logo.trim() || "💼",
          status: form.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to save placement");
      }

      toast.success(
        editing
          ? "Placement updated successfully"
          : "Placement created and students notified"
      );

      closeModal();
      await loadPlacements();
    } catch (error) {
      console.error("Save placement error:", error);
      toast.error(error?.message || "Failed to save placement");
    } finally {
      setSaving(false);
    }
  };

  /* ===================================================
     DELETE
  =================================================== */

  const deletePlacement = async (placement) => {
    const token = getToken();

    if (!token) {
      toast.error("Please login as admin.");
      return;
    }

    const placementId = placement?._id;

    const confirmed = window.confirm(
      `Remove "${placement?.role || "this placement"}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(placementId);

      const response = await fetch(`${API_URL}/${placementId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to remove placement");
      }

      setPlacements((previous) =>
        previous.filter((item) => String(item?._id) !== String(placementId))
      );

      toast.success("Placement removed successfully");
    } catch (error) {
      console.error("Delete placement error:", error);
      toast.error(error?.message || "Failed to remove placement");
    } finally {
      setDeletingId(null);
    }
  };

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <AppShell
      title="Placements"
      subtitle={`${placements.length} opportunities posted`}
      action={
        <Button className="gap-2 rounded-xl" onClick={openCreateModal}>
          <Plus className="size-4" />
          Post opportunity
        </Button>
      }
    >
      <div className="space-y-6">
        {/* SEARCH */}
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search role, company or location..."
            className="rounded-xl bg-card/70 pl-9"
          />
        </div>

        {/* LIST */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-56 animate-pulse rounded-3xl bg-muted/40"
              />
            ))}
          </div>
        ) : filteredPlacements.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredPlacements.map((placement) => {
              const placementId = placement?._id;
              const deadlinePassed =
                placement?.deadline &&
                new Date(placement.deadline) < new Date();

              return (
                <GlassCard key={placementId}>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-secondary text-lg">
                        {placement?.logo || "💼"}
                      </span>
                      <div className="min-w-0">
                        <h2 className="truncate font-display text-base font-bold">
                          {placement?.role || "Untitled role"}
                        </h2>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {placement?.company || "Company"}
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant={
                        placement?.status === "Closed" || deadlinePassed
                          ? "outline"
                          : "secondary"
                      }
                      className="shrink-0 rounded-lg"
                    >
                      {placement?.status === "Closed"
                        ? "Closed"
                        : deadlinePassed
                          ? "Deadline passed"
                          : "Active"}
                    </Badge>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="rounded-lg">
                      {placement?.type || "Internship"}
                    </Badge>
                    {placement?.location && (
                      <Badge variant="outline" className="gap-1 rounded-lg">
                        <MapPin className="size-3" /> {placement.location}
                      </Badge>
                    )}
                    {placement?.stipend && (
                      <Badge variant="outline" className="rounded-lg">
                        {placement.stipend}
                      </Badge>
                    )}
                  </div>

                  <div className="mt-4 space-y-2">
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarClock className="size-4 shrink-0" />
                      Apply before {formatDate(placement?.deadline)}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="size-4 shrink-0" />
                      {placement?.applicantCount || 0} applicants
                    </p>
                  </div>

                  {placement?.description && (
                    <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">
                      {placement.description}
                    </p>
                  )}

                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-2 rounded-xl bg-card/60"
                      onClick={() => openEditModal(placement)}
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-2 rounded-xl text-destructive hover:bg-destructive/10"
                      disabled={deletingId === placementId}
                      onClick={() => deletePlacement(placement)}
                    >
                      <Trash2 className="size-3.5" />
                      {deletingId === placementId ? "Removing..." : "Remove"}
                    </Button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        ) : (
          <GlassCard className="py-14 text-center">
            <Briefcase className="mx-auto size-9 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold">
              No placements found
            </p>
          </GlassCard>
        )}

        {/* CREATE / EDIT MODAL */}
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border/60 bg-background p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-bold">
                    {editingId ? "Edit opportunity" : "Post opportunity"}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Students are notified when a new opportunity is posted.
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={closeModal}
                >
                  <X className="size-5" />
                </Button>
              </div>

              <div className="mt-6 grid gap-4">
                {/* ROLE + COMPANY */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Role
                    </label>
                    <Input
                      value={form.role}
                      maxLength={100}
                      onChange={(event) =>
                        updateField("role", event.target.value)
                      }
                      placeholder="e.g. SDE Intern"
                      className="rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Company
                    </label>
                    <Input
                      value={form.company}
                      maxLength={100}
                      onChange={(event) =>
                        updateField("company", event.target.value)
                      }
                      placeholder="e.g. Google"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                {/* TYPE + STATUS */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Type
                    </label>
                    <select
                      value={form.type}
                      onChange={(event) =>
                        updateField("type", event.target.value)
                      }
                      className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                    >
                      {placementTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(event) =>
                        updateField("status", event.target.value)
                      }
                      className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                    >
                      <option value="Active">Active</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                {/* LOCATION + STIPEND */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Location
                    </label>
                    <Input
                      value={form.location}
                      maxLength={100}
                      onChange={(event) =>
                        updateField("location", event.target.value)
                      }
                      placeholder="e.g. Bengaluru / Remote"
                      className="rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Stipend / CTC
                    </label>
                    <Input
                      value={form.stipend}
                      maxLength={60}
                      onChange={(event) =>
                        updateField("stipend", event.target.value)
                      }
                      placeholder="e.g. ₹40,000/mo"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                {/* DEADLINE + LOGO */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Application deadline
                    </label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="DD-MM-YYYY"
                      maxLength={10}
                      value={form.deadline}
                      onChange={(event) => {
                        const value = event.target.value
                          .replace(/[^0-9-]/g, "")
                          .slice(0, 10);

                        updateField("deadline", value);
                      }}
                      className="rounded-xl"
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Example: 15-09-2026
                    </p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Logo (emoji)
                    </label>
                    <Input
                      value={form.logo}
                      maxLength={4}
                      onChange={(event) =>
                        updateField("logo", event.target.value)
                      }
                      placeholder="💼"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                {/* ELIGIBILITY */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Eligibility
                  </label>
                  <Input
                    value={form.eligibility}
                    maxLength={150}
                    onChange={(event) =>
                      updateField("eligibility", event.target.value)
                    }
                    placeholder="e.g. B.Tech CSE/IT, CGPA 7+"
                    className="rounded-xl"
                  />
                </div>

                {/* SKILLS */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Skills (comma separated)
                  </label>
                  <Input
                    value={form.skills}
                    maxLength={200}
                    onChange={(event) =>
                      updateField("skills", event.target.value)
                    }
                    placeholder="e.g. React, Node.js, SQL"
                    className="rounded-xl"
                  />
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    maxLength={600}
                    onChange={(event) =>
                      updateField("description", event.target.value)
                    }
                    placeholder="Describe the role..."
                    className="min-h-28 w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  className="rounded-xl"
                  onClick={savePlacement}
                  disabled={
                    saving ||
                    !form.role.trim() ||
                    !form.company.trim() ||
                    !form.deadline.trim()
                  }
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Post opportunity"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default ManagePlacements;
