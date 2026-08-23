import { createFileRoute } from "@tanstack/react-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  CalendarDays,
  MapPin,
  Users,
  X,
} from "lucide-react";

import { toast } from "sonner";

import {
  AppShell,
  GlassCard,
} from "@/components/AppShell";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { API_BASE_URL } from "../lib/api-config.js";

export const Route = createFileRoute(
  "/admin/events"
)({
  head: () => ({
    meta: [
      {
        title:
          "Manage Events — CampusConnect",
      },
      {
        name: "description",
        content:
          "Create, publish and manage campus events.",
      },
    ],
  }),

  component: ManageEvents,
});

const API_URL =
  `${API_BASE_URL}/api/events`;

/* =====================================================
   DATE HELPERS
===================================================== */

/*
  Convert:
    DD-MM-YYYY
  to:
    YYYY-MM-DD
*/

function convertDisplayDateToApi(
  value
) {
  const cleaned =
    String(value || "").trim();

  if (!cleaned) {
    return "";
  }

  const match =
    cleaned.match(
      /^(\d{2})-(\d{2})-(\d{4})$/
    );

  if (!match) {
    return null;
  }

  const day =
    Number(match[1]);

  const month =
    Number(match[2]);

  const year =
    Number(match[3]);

  const testDate =
    new Date(
      year,
      month - 1,
      day
    );

  /*
    Prevent invalid dates such as:
    31-02-2026
  */

  if (
    testDate.getFullYear() !==
      year ||
    testDate.getMonth() !==
      month - 1 ||
    testDate.getDate() !==
      day
  ) {
    return null;
  }

  return `${year}-${String(
    month
  ).padStart(2, "0")}-${String(
    day
  ).padStart(2, "0")}`;
}

/*
  Convert:
    YYYY-MM-DD
  to:
    DD-MM-YYYY
*/

function convertApiDateToDisplay(
  value
) {
  if (!value) {
    return "";
  }

  const cleaned =
    String(value).split("T")[0];

  const match =
    cleaned.match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );

  if (!match) {
    return String(value);
  }

  return `${match[3]}-${match[2]}-${match[1]}`;
}

function formatDate(date) {
  if (!date) {
    return "Date not set";
  }

  const cleaned =
    String(date).split("T")[0];

  const match =
    cleaned.match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );

  if (match) {
    return `${match[3]}-${match[2]}-${match[1]}`;
  }

  return String(date);
}

/* =====================================================
   DEFAULT FORM
===================================================== */

const emptyForm = {
  name: "",
  club: "",
  desc: "",
  date: "",
  venue: "",
  regCap: "100",
  status: "Upcoming",
};

/* =====================================================
   COMPONENT
===================================================== */

function ManageEvents() {
  const [events, setEvents] =
    useState([]);

  const [query, setQuery] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [form, setForm] =
    useState({
      ...emptyForm,
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  /* ===================================================
     TOKEN
  =================================================== */

  const getToken = () =>
    localStorage.getItem(
      "campusconnect_token"
    );

  /* ===================================================
     LOAD EVENTS
  =================================================== */

  const loadEvents =
    useCallback(async () => {
      try {
        setLoading(true);

        const response =
          await fetch(API_URL);

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to load events"
          );
        }

        setEvents(
          Array.isArray(
            data?.events
          )
            ? data.events
            : []
        );
      } catch (error) {
        console.error(
          "Load events error:",
          error
        );

        toast.error(
          error?.message ||
            "Failed to load events"
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  /* ===================================================
     FILTER
  =================================================== */

  const filteredEvents =
    useMemo(() => {
      const value =
        query
          .trim()
          .toLowerCase();

      if (!value) {
        return events;
      }

      return events.filter(
        (event) =>
          [
            event?.name,
            event?.club,
            event?.desc,
            event?.venue,
            event?.status,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(value)
      );
    }, [events, query]);

  /* ===================================================
     OPEN CREATE
  =================================================== */

  const openCreateModal = () => {
    setEditingId(null);

    setForm({
      ...emptyForm,
    });

    setShowModal(true);
  };

  /* ===================================================
     OPEN EDIT
  =================================================== */

  const openEditModal = (
    event
  ) => {
    setEditingId(
      event?._id ||
        event?.id ||
        null
    );

    setForm({
      name:
        event?.name || "",

      club:
        event?.club || "",

      desc:
        event?.desc || "",

      date:
        convertApiDateToDisplay(
          event?.date
        ),

      venue:
        event?.venue || "",

      regCap:
        String(
          event?.regCap || 100
        ),

      status:
        event?.status ||
        "Upcoming",
    });

    setShowModal(true);
  };

  /* ===================================================
     CLOSE MODAL
  =================================================== */

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingId(null);

    setForm({
      ...emptyForm,
    });
  };

  /* ===================================================
     UPDATE FIELD
  =================================================== */

  const updateField = (
    field,
    value
  ) => {
    setForm(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    );
  };

  /* ===================================================
     SAVE
  =================================================== */

  const saveEvent =
    async () => {
      const token =
        getToken();

      if (!token) {
        toast.error(
          "Please login as admin."
        );

        return;
      }

      const name =
        form.name.trim();

      const club =
        form.club.trim();

      const desc =
        form.desc.trim();

      const venue =
        form.venue.trim();

      if (!name) {
        toast.error(
          "Event name is required."
        );

        return;
      }

      /*
        IMPORTANT:

        We accept ANY valid calendar date.

        There is NO:
          - past date restriction
          - future date restriction
          - min date
          - max date
      */

      const apiDate =
        convertDisplayDateToApi(
          form.date
        );

      if (apiDate === null) {
        toast.error(
          "Enter a valid date in DD-MM-YYYY format."
        );

        return;
      }

      if (!apiDate) {
        toast.error(
          "Event date is required."
        );

        return;
      }

      const registrationCapacity =
        Math.max(
          1,
          Number(
            form.regCap
          ) || 1
        );

      try {
        setSaving(true);

        const editing =
          Boolean(
            editingId
          );

        const url =
          editing
            ? `${API_URL}/${editingId}`
            : API_URL;

        const method =
          editing
            ? "PUT"
            : "POST";

        const response =
          await fetch(
            url,
            {
              method,

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                name,

                club,

                desc,

                /*
                  Backend receives:
                  YYYY-MM-DD
                */

                date:
                  apiDate,

                venue,

                regCap:
                  registrationCapacity,

                status:
                  form.status,
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to save event"
          );
        }

        toast.success(
          editing
            ? "Event updated successfully"
            : "Event created successfully"
        );

        closeModal();

        await loadEvents();
      } catch (error) {
        console.error(
          "Save event error:",
          error
        );

        toast.error(
          error?.message ||
            "Failed to save event"
        );
      } finally {
        setSaving(false);
      }
    };

  /* ===================================================
     DELETE
  =================================================== */

  const deleteEvent =
    async (event) => {
      const token =
        getToken();

      if (!token) {
        toast.error(
          "Please login as admin."
        );

        return;
      }

      const eventId =
        event?._id ||
        event?.id;

      const confirmed =
        window.confirm(
          `Remove "${event?.name || "this event"}"?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeletingId(
          eventId
        );

        const response =
          await fetch(
            `${API_URL}/${eventId}`,
            {
              method: "DELETE",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to remove event"
          );
        }

        setEvents(
          (previous) =>
            previous.filter(
              (item) =>
                String(
                  item?._id ||
                    item?.id
                ) !==
                String(eventId)
            )
        );

        toast.success(
          "Event removed successfully"
        );
      } catch (error) {
        console.error(
          "Delete event error:",
          error
        );

        toast.error(
          error?.message ||
            "Failed to remove event"
        );
      } finally {
        setDeletingId(null);
      }
    };

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <AppShell
      title="Events"
      subtitle={`${events.length} events in the catalogue`}
      action={
        <Button
          className="gap-2 rounded-xl"
          onClick={
            openCreateModal
          }
        >
          <Plus className="size-4" />
          Create event
        </Button>
      }
    >
      <div className="space-y-6">

        {/* SEARCH */}

        <div className="relative max-w-xl">

          <Search
            className="
              absolute
              left-3
              top-1/2
              size-4
              -translate-y-1/2
              text-muted-foreground
            "
          />

          <Input
            value={query}
            onChange={(event) =>
              setQuery(
                event.target.value
              )
            }
            placeholder="Search events or clubs..."
            className="
              rounded-xl
              bg-card/70
              pl-9
            "
          />

        </div>

        {/* EVENTS */}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="
                    h-56
                    animate-pulse
                    rounded-3xl
                    bg-muted/40
                  "
                />
              )
            )}
          </div>
        ) : filteredEvents.length >
          0 ? (
          <div className="grid gap-4 md:grid-cols-2">

            {filteredEvents.map(
              (event) => {
                const eventId =
                  event?._id ||
                  event?.id;

                const capacity =
                  Number(
                    event?.regCap
                  ) || 1;

                const registered =
                  Number(
                    event?.regCount
                  ) || 0;

                const percentage =
                  Math.min(
                    100,
                    (registered /
                      capacity) *
                      100
                  );

                return (
                  <GlassCard
                    key={eventId}
                  >

                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">

                      <div className="min-w-0">

                        <h2 className="truncate font-display text-base font-bold">
                          {event?.name ||
                            "Untitled event"}
                        </h2>

                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {event?.club ||
                            "Campus event"}
                        </p>

                      </div>

                      <Badge
                        variant="secondary"
                        className="shrink-0 rounded-lg"
                      >
                        {event?.status ||
                          "Upcoming"}
                      </Badge>

                    </div>

                    <div className="mt-4 space-y-2">

                      <p className="flex items-center gap-2 text-sm text-muted-foreground">

                        <CalendarDays className="size-4 shrink-0" />

                        {formatDate(
                          event?.date
                        )}

                      </p>

                      <p className="flex items-center gap-2 text-sm text-muted-foreground">

                        <MapPin className="size-4 shrink-0" />

                        {event?.venue ||
                          "Venue not announced"}

                      </p>

                    </div>

                    {event?.desc && (
                      <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">
                        {event.desc}
                      </p>
                    )}

                    <div className="mt-4">

                      <div className="flex items-center justify-between text-xs text-muted-foreground">

                        <span className="flex items-center gap-1.5">

                          <Users className="size-3.5" />

                          Registrations

                        </span>

                        <span>
                          {registered}/
                          {capacity}
                        </span>

                      </div>

                      <Progress
                        value={
                          percentage
                        }
                        className="mt-1.5 h-2"
                      />

                    </div>

                    <div className="mt-4 flex gap-2">

                      <Button
                        size="sm"
                        variant="outline"
                        className="
                          flex-1
                          gap-2
                          rounded-xl
                          bg-card/60
                        "
                        onClick={() =>
                          openEditModal(
                            event
                          )
                        }
                      >
                        <Pencil className="size-3.5" />
                        Edit
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="
                          flex-1
                          gap-2
                          rounded-xl
                          text-destructive
                          hover:bg-destructive/10
                        "
                        disabled={
                          deletingId ===
                          eventId
                        }
                        onClick={() =>
                          deleteEvent(
                            event
                          )
                        }
                      >
                        <Trash2 className="size-3.5" />

                        {deletingId ===
                        eventId
                          ? "Removing..."
                          : "Remove"}
                      </Button>

                    </div>

                  </GlassCard>
                );
              }
            )}

          </div>
        ) : (
          <GlassCard className="py-14 text-center">

            <CalendarDays className="mx-auto size-9 text-muted-foreground" />

            <p className="mt-3 text-sm font-semibold">
              No events found
            </p>

          </GlassCard>
        )}

        {/* CREATE / EDIT MODAL */}

        {showModal && (
          <div
            className="
              fixed
              inset-0
              z-[100]
              flex
              items-center
              justify-center
              bg-black/45
              p-4
              backdrop-blur-sm
            "
          >

            <div
              className="
                w-full
                max-w-2xl
                rounded-3xl
                border
                border-border/60
                bg-background
                p-6
                shadow-2xl
              "
            >

              <div className="flex items-start justify-between gap-4">

                <div>

                  <h2 className="font-display text-xl font-bold">
                    {editingId
                      ? "Edit event"
                      : "Create event"}
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Select any past, present or future date.
                  </p>

                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={
                    closeModal
                  }
                >
                  <X className="size-5" />
                </Button>

              </div>

              <div className="mt-6 grid gap-4">

                {/* EVENT NAME */}

                <div>

                  <label className="mb-1.5 block text-sm font-medium">
                    Event name
                  </label>

                  <Input
                    value={form.name}
                    maxLength={90}
                    onChange={(event) =>
                      updateField(
                        "name",
                        event.target.value
                      )
                    }
                    placeholder="e.g. AI Hackathon 2026"
                    className="rounded-xl"
                  />

                </div>

                {/* CLUB + STATUS */}

                <div className="grid gap-4 sm:grid-cols-2">

                  <div>

                    <label className="mb-1.5 block text-sm font-medium">
                      Club / organizer
                    </label>

                    <Input
                      value={form.club}
                      maxLength={100}
                      onChange={(event) =>
                        updateField(
                          "club",
                          event.target.value
                        )
                      }
                      placeholder="e.g. Coding Club"
                      className="rounded-xl"
                    />

                  </div>

                  <div>

                    <label className="mb-1.5 block text-sm font-medium">
                      Status
                    </label>

                    <select
                      value={
                        form.status
                      }
                      onChange={(event) =>
                        updateField(
                          "status",
                          event.target.value
                        )
                      }
                      className="
                        h-10
                        w-full
                        rounded-xl
                        border
                        border-input
                        bg-background
                        px-3
                        text-sm
                      "
                    >
                      <option value="Upcoming">
                        Upcoming
                      </option>

                      <option value="Ongoing">
                        Ongoing
                      </option>

                      <option value="Completed">
                        Completed
                      </option>
                    </select>

                  </div>

                </div>

                {/* =================================================
                    DATE + VENUE
                ================================================= */}

                <div className="grid gap-4 sm:grid-cols-2">

                  <div>

                    <label className="mb-1.5 block text-sm font-medium">
                      Event date
                    </label>

                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="DD-MM-YYYY"
                      maxLength={10}
                      value={
                        form.date
                      }
                      onChange={(event) => {
                        /*
                          Allow only numbers and -
                        */

                        const value =
                          event.target.value
                            .replace(
                              /[^0-9-]/g,
                              ""
                            )
                            .slice(
                              0,
                              10
                            );

                        updateField(
                          "date",
                          value
                        );
                      }}
                      className="rounded-xl"
                    />

                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Example: 10-08-2026. Past dates are allowed.
                    </p>

                  </div>

                  <div>

                    <label className="mb-1.5 block text-sm font-medium">
                      Venue
                    </label>

                    <Input
                      value={
                        form.venue
                      }
                      maxLength={150}
                      onChange={(event) =>
                        updateField(
                          "venue",
                          event.target.value
                        )
                      }
                      placeholder="e.g. Seminar Wing"
                      className="rounded-xl"
                    />

                  </div>

                </div>

                {/* DESCRIPTION */}

                <div>

                  <label className="mb-1.5 block text-sm font-medium">
                    Description
                  </label>

                  <textarea
                    value={
                      form.desc
                    }
                    maxLength={500}
                    onChange={(event) =>
                      updateField(
                        "desc",
                        event.target.value
                      )
                    }
                    placeholder="Describe the event..."
                    className="
                      min-h-28
                      w-full
                      resize-none
                      rounded-xl
                      border
                      border-input
                      bg-background
                      px-3
                      py-2
                      text-sm
                    "
                  />

                </div>

                {/* CAPACITY */}

                <div>

                  <label className="mb-1.5 block text-sm font-medium">
                    Registration capacity
                  </label>

                  <Input
                    type="number"
                    min="1"
                    value={
                      form.regCap
                    }
                    onChange={(event) =>
                      updateField(
                        "regCap",
                        event.target.value
                      )
                    }
                    className="rounded-xl"
                  />

                </div>

              </div>

              <div className="mt-6 flex justify-end gap-2">

                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={
                    closeModal
                  }
                  disabled={saving}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  className="rounded-xl"
                  onClick={
                    saveEvent
                  }
                  disabled={
                    saving ||
                    !form.name.trim() ||
                    !form.date.trim()
                  }
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Create event"}
                </Button>

              </div>

            </div>

          </div>
        )}

      </div>
    </AppShell>
  );
}

export default ManageEvents;