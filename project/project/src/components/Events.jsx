import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  MapPin,
  Users,
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
  seedClubs,
  seedStudents,
  seedEvents,
  STATUS_STYLES,
} from "../data/mockData";

import {
  formatDate,
  inputCls,
  textareaCls,
  rosterFor,
  cardShadowCls,
  secondaryBtnCls,
  primaryBtnCls,
} from "../utils";
import { API_BASE_URL } from "../api-config.js";

/* =====================================================
   BACKEND API URL
===================================================== */

const API_URL = `${API_BASE_URL}/api/events`;

/* =====================================================
   EVENT FORM
===================================================== */

function EventForm({
  initial,
  clubNames,
  onCancel,
  onSubmit,
}) {
  const [form, setForm] = useState(
    initial || {
      name: "",
      club: clubNames[0] || "",
      desc: "",
      date: "",
      venue: "",
      regCap: 100,
      status: "Upcoming",
    }
  );

  const set = (key) => (event) => {
    setForm({
      ...form,
      [key]: event.target.value,
    });
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();

        if (!form.name.trim() || !form.date) {
          return;
        }

        onSubmit(form);
      }}
    >
      <Field label="Event name">
        <input
          className={inputCls}
          value={form.name}
          onChange={set("name")}
          placeholder="e.g. Design Sprint"
          required
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Hosting club">
          <Select
            value={form.club}
            onChange={set("club")}
          >
            {clubNames.map((club) => (
              <option key={club}>
                {club}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Status">
          <Select
            value={form.status}
            onChange={set("status")}
          >
            {[
              "Upcoming",
              "Ongoing",
              "Completed",
            ].map((status) => (
              <option key={status}>
                {status}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Description">
        <textarea
          className={
            textareaCls + " min-h-[60px]"
          }
          value={form.desc}
          onChange={set("desc")}
          placeholder="What happens at this event"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Date">
          <input
            type="date"
            className={inputCls}
            value={form.date}
            onChange={set("date")}
            required
          />
        </Field>

        <Field label="Venue">
          <input
            className={inputCls}
            value={form.venue}
            onChange={set("venue")}
            placeholder="e.g. Seminar Wing"
          />
        </Field>
      </div>

      <Field label="Registration capacity">
        <input
          type="number"
          min="1"
          className={inputCls}
          value={form.regCap}
          onChange={set("regCap")}
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
          {initial
            ? "Save changes"
            : "Create event"}
        </button>
      </div>
    </form>
  );
}

/* =====================================================
   EVENTS PAGE
===================================================== */

export default function Events({ notify }) {
  const clubNames = seedClubs.map(
    (club) => club.name
  );

  const [events, setEvents] = useState(
    seedEvents.map((event) => ({ ...event, id: event.id || event._id }))
  );

  const [query, setQuery] =
    useState("");

  const [tab, setTab] =
    useState("All");

  const [modal, setModal] =
    useState(null);

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState(null);

  const [
    rosterEvent,
    setRosterEvent,
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  /* =====================================================
     GET ALL EVENTS
  ===================================================== */

  const fetchEvents = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        API_URL
      );

      const data =
        await response.json();

      if (!response.ok) {
        console.error(
          data.message ||
            "Failed to fetch events"
        );
        setEvents(
          seedEvents.map((event) => ({ ...event, id: event.id || event._id }))
        );
        return;
      }

      const formattedEvents =
        (data.events || []).map(
          (event) => ({
            ...event,
            id: event._id || event.id,
          })
        );

      setEvents(
        formattedEvents.length
          ? formattedEvents
          : seedEvents.map((event) => ({ ...event, id: event.id || event._id }))
      );
    } catch (error) {
      console.error(
        "Fetch events error:",
        error
      );
      setEvents(
        seedEvents.map((event) => ({ ...event, id: event.id || event._id }))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  /* =====================================================
     FILTER EVENTS
  ===================================================== */

  const filtered = useMemo(() => {
    const q = query
      .trim()
      .toLowerCase();

    return events.filter(
      (event) => {
        const matchesTab =
          tab === "All" ||
          event.status === tab;

        const matchesQ =
          !q ||
          [
            event.name,
            event.club,
            event.venue,
          ]
            .join(" ")
            .toLowerCase()
            .includes(q);

        return (
          matchesTab &&
          matchesQ
        );
      }
    );
  }, [events, query, tab]);

  /* =====================================================
     CREATE EVENT
  ===================================================== */

  const handleCreate = async (
    form
  ) => {
    try {
      const token =
        localStorage.getItem(
          "adminToken"
        );

      if (!token) {
        const newEvent = {
          ...form,
          id: `demo-${Date.now()}`,
          _id: `demo-${Date.now()}`,
          name: form.name.trim(),
          club: form.club,
          desc: form.desc,
          date: form.date,
          venue: form.venue,
          regCount: Number(form.regCap) || 100,
          regCap: Number(form.regCap) || 100,
          status: form.status,
        };

        setEvents((previous) => [newEvent, ...previous]);
        setModal(null);
        notify?.({ title: "Event created", subtitle: form.name });
        return;
      }

      const response = await fetch(
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

            club:
              form.club,

            desc:
              form.desc,

            date:
              form.date,

            venue:
              form.venue,

            regCap:
              Number(
                form.regCap
              ) || 100,

            status:
              form.status,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to create event"
        );
        return;
      }

      const newEvent = {
        ...data.event,
        id: data.event._id,
      };

      setEvents(
        (previous) => [
          newEvent,
          ...previous,
        ]
      );

      setModal(null);

      if (notify) {
        notify({
          title:
            "Event created",

          subtitle:
            form.name,
        });
      }
    } catch (error) {
      console.error(
        "Create event error:",
        error
      );

      alert(
        "Cannot connect to backend."
      );
    }
  };

  /* =====================================================
     UPDATE EVENT
  ===================================================== */

  const handleEdit = async (
    form
  ) => {
    try {
      const token =
        localStorage.getItem(
          "adminToken"
        );

      if (!token) {
        setEvents((previous) =>
          previous.map((event) =>
            event._id === (modal.event._id || modal.event.id) || event.id === (modal.event._id || modal.event.id)
              ? { ...event, ...form, id: event.id || event._id, _id: event._id || event.id, name: form.name.trim(), club: form.club, desc: form.desc, date: form.date, venue: form.venue, regCap: Number(form.regCap) || 100, status: form.status }
              : event
          )
        );
        setModal(null);
        notify?.({ title: "Event updated", subtitle: form.name });
        return;
      }

      const eventId =
        modal.event._id ||
        modal.event.id;

      const response = await fetch(
        `${API_URL}/${eventId}`,
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

            club:
              form.club,

            desc:
              form.desc,

            date:
              form.date,

            venue:
              form.venue,

            regCap:
              Number(
                form.regCap
              ) || 100,

            status:
              form.status,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to update event"
        );
        return;
      }

      const updatedEvent = {
        ...data.event,
        id: data.event._id,
      };

      setEvents(
        (previous) =>
          previous.map(
            (event) =>
              event._id ===
              data.event._id
                ? updatedEvent
                : event
          )
      );

      setModal(null);

      if (notify) {
        notify({
          title:
            "Event updated",

          subtitle:
            form.name,
        });
      }
    } catch (error) {
      console.error(
        "Update event error:",
        error
      );

      alert(
        "Cannot connect to backend."
      );
    }
  };

  /* =====================================================
     DELETE EVENT
  ===================================================== */

  const handleDelete = async (
    event
  ) => {
    try {
      const token =
        localStorage.getItem(
          "adminToken"
        );

      if (!token) {
        setEvents((previous) => previous.filter((item) => (item._id || item.id) !== (event._id || event.id)));
        setDeleteTarget(null);
        notify?.({ title: "Event deleted", subtitle: event.name });
        return;
      }

      const eventId =
        event._id ||
        event.id;

      const response = await fetch(
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
        alert(
          data.message ||
            "Failed to delete event"
        );
        return;
      }

      setEvents(
        (previous) =>
          previous.filter(
            (item) =>
              item._id !==
              eventId
          )
      );

      if (notify) {
        notify({
          title:
            "Event deleted",

          subtitle:
            event.name,
        });
      }
    } catch (error) {
      console.error(
        "Delete event error:",
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
     UI
  ===================================================== */

  return (
    <div>
      <SectionHeader
        title="Events"
        subtitle={`${events.length} events scheduled this academic year`}
        action={{
          label:
            "Create event",

          icon: (
            <Plus
              size={16}
            />
          ),

          onClick: () =>
            setModal({
              mode: "create",
            }),
        }}
      />

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-5">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search events or clubs..."
          className="sm:w-[37.5%] sm:flex-none"
        />

        <div className="flex bg-slate-100 rounded-full p-1 self-start sm:ml-auto">
          {[
            "All",
            "Upcoming",
            "Ongoing",
            "Completed",
          ].map((item) => (
            <button
              key={item}
              onClick={() =>
                setTab(item)
              }
              className={`px-3.5 py-1.5 text-sm rounded-full font-medium transition ${
                tab === item
                  ? "bg-white shadow text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="mt-8 text-center text-slate-500">
          Loading events...
        </div>
      )}

      {!loading && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
            {filtered.map(
              (event) => {
                const percentage =
                  event.regCap
                    ? Math.min(
                        100,
                        Math.round(
                          (event.regCount /
                            event.regCap) *
                            100
                        )
                      )
                    : 0;

                return (
                  <div
                    key={
                      event._id ||
                      event.id
                    }
                    className={`rounded-2xl border border-slate-100 bg-white ${cardShadowCls} p-5`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {
                            event.name
                          }
                        </h3>

                        <p className="text-sm text-blue-600">
                          {
                            event.club
                          }
                        </p>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${
                          STATUS_STYLES[
                            event
                              .status
                          ] || ""
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0" />

                        {
                          event.status
                        }
                      </span>
                    </div>

                    <p className="text-sm text-slate-500 mt-2">
                      {
                        event.desc
                      }
                    </p>

                    <div className="flex items-center gap-4 text-sm text-slate-500 mt-3">
                      <span className="flex items-center gap-1.5">
                        <Calendar
                          size={
                            14
                          }
                        />

                        {formatDate(
                          event.date
                        )}
                      </span>

                      <span className="flex items-center gap-1.5">
                        <MapPin
                          size={
                            14
                          }
                        />

                        {
                          event.venue
                        }
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="text-slate-500">
                          Registrations
                        </span>

                        <span className="font-semibold text-slate-800">
                          {event.regCount ||
                            0}
                          /
                          {
                            event.regCap
                          }
                        </span>
                      </div>

                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200">
                      <button
                        onClick={() =>
                          setRosterEvent(
                            event
                          )
                        }
                        className="flex items-center gap-1.5 text-sm font-medium text-slate-900 hover:text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full px-3 py-1.5"
                      >
                        <Users
                          size={
                            14
                          }
                        />

                        Registered
                      </button>

                      <div className="flex-1" />

                      <button
                        onClick={() =>
                          setModal({
                            mode: "edit",
                            event,
                          })
                        }
                        className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full p-1.5 transition-colors"
                      >
                        <Pencil
                          size={
                            16
                          }
                        />
                      </button>

                      <button
                        onClick={() =>
                          setDeleteTarget(
                            event
                          )
                        }
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-1.5 transition-colors"
                      >
                        <Trash2
                          size={
                            16
                          }
                        />
                      </button>
                    </div>
                  </div>
                );
              }
            )}

            {filtered.length ===
              0 && (
              <EmptyState text="No events match your filters." />
            )}
          </div>

          <div
            className={`rounded-2xl border border-slate-100 bg-white ${cardShadowCls} mt-6 overflow-hidden`}
          >
            <div className="px-5 py-4 border-b border-slate-200 font-semibold text-slate-900">
              All events
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="px-5 py-3 font-medium">
                      Event
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Club
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Date
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Venue
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Registered
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {events.map(
                    (event) => (
                      <tr
                        key={
                          event._id ||
                          event.id
                        }
                        className="border-b border-slate-200 last:border-0"
                      >
                        <td className="px-5 py-3 font-medium text-slate-800">
                          {
                            event.name
                          }
                        </td>

                        <td className="px-5 py-3 text-blue-600">
                          {
                            event.club
                          }
                        </td>

                        <td className="px-5 py-3 text-slate-600">
                          {formatDate(
                            event.date
                          )}
                        </td>

                        <td className="px-5 py-3 text-slate-600">
                          {
                            event.venue
                          }
                        </td>

                        <td className="px-5 py-3 text-slate-600">
                          {event.regCount ||
                            0}
                          /
                          {
                            event.regCap
                          }
                        </td>

                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                              STATUS_STYLES[
                                event
                                  .status
                              ] ||
                              ""
                            }`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0" />

                            {
                              event.status
                            }
                          </span>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* CREATE / EDIT MODAL */}

      {modal && (
        <Modal
          title={
            modal.mode ===
            "create"
              ? "Create event"
              : "Edit event"
          }
          subtitle={
            modal.mode ===
            "create"
              ? "Schedule a new campus event."
              : modal.event
                  .name
          }
          onClose={() =>
            setModal(null)
          }
        >
          <EventForm
            initial={
              modal.mode ===
              "edit"
                ? modal.event
                : null
            }
            clubNames={
              clubNames
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

      {/* REGISTERED STUDENTS */}

      {rosterEvent && (
        <PersonListModal
          title="Registered students"
          subtitle={`${
            rosterEvent.regCount ||
            0
          } students registered for ${
            rosterEvent.name
          }.`}
          people={rosterFor(
            seedStudents,
            rosterEvent.id,
            rosterEvent.regCount ||
              0
          )}
          meta={(person) =>
            `${person.rollNo} · ${person.department}`
          }
          onClose={() =>
            setRosterEvent(
              null
            )
          }
        />
      )}

      {/* DELETE CONFIRMATION */}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this event?"
          message={`"${deleteTarget.name}" and its registration data will be permanently removed. This can't be undone.`}
          confirmLabel="Delete event"
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