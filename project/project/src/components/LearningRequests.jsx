import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  UserRoundCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Check,
  X,
  RefreshCw,
} from "lucide-react";

import {
  SectionHeader,
  SearchBar,
  StatCard,
} from "./Shared";

import {
  formatDate,
  initials,
  cardShadowCls,
  AVATAR_COLORS,
} from "../utils";
import { API_BASE_URL } from "../api-config.js";
import { adminFetch } from "../api-client.js";

/* =====================================================
   BACKEND API
===================================================== */

const API_URL =
  `${API_BASE_URL}/api/peer-learning`;

const STATIC_REQUESTS = [
  {
    _id: "req-1",
    subject: "Need a study partner for Operating Systems",
    status: "Open",
    createdAt: "2026-08-22T09:15:00.000Z",
    requestedBy: {
      name: "Aarav Sharma",
      email: "aarav.sharma@campus.edu",
      studentId: "CS-2023-118",
    },
  },
  {
    _id: "req-2",
    subject: "Looking for a mentor in Data Structures",
    status: "Accepted",
    createdAt: "2026-08-21T14:40:00.000Z",
    requestedBy: {
      name: "Priya Patil",
      email: "priya.patil@campus.edu",
      studentId: "IT-2024-042",
    },
  },
  {
    _id: "req-3",
    subject: "Need help preparing for DBMS interview rounds",
    status: "Open",
    createdAt: "2026-08-23T08:10:00.000Z",
    requestedBy: {
      name: "Rahul Verma",
      email: "rahul.verma@campus.edu",
      studentId: "CSE-2022-207",
    },
  },
  {
    _id: "req-4",
    subject: "Group study request for Machine Learning lab",
    status: "Cancelled",
    createdAt: "2026-08-19T11:25:00.000Z",
    requestedBy: {
      name: "Sneha Kulkarni",
      email: "sneha.kulkarni@campus.edu",
      studentId: "ECE-2023-113",
    },
  },
  {
    _id: "req-5",
    subject: "Looking for peer practice before Java aptitude test",
    status: "Open",
    createdAt: "2026-08-23T10:05:00.000Z",
    requestedBy: {
      name: "Rohan Joshi",
      email: "rohan.joshi@campus.edu",
      studentId: "ME-2024-056",
    },
  },
];

/* =====================================================
   COMPONENT
===================================================== */

export default function LearningRequests({
  notify,
}) {
  const [requests, setRequests] =
    useState(STATIC_REQUESTS);

  const [query, setQuery] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [actionId, setActionId] =
    useState(null);

  /* ===================================================
     ADMIN TOKEN
  =================================================== */

  const getToken = () => {
    return localStorage.getItem(
      "adminToken"
    );
  };

  /* ===================================================
     FETCH REAL REQUESTS
  =================================================== */

  const fetchRequests =
    useCallback(
      async (showRefresh = false) => {
        const token =
          getToken();

        if (!token) {
          setRequests(STATIC_REQUESTS);
          setLoading(false);

          notify?.({
            title:
              "Admin authentication required",
            subtitle:
              "Using demo learning requests for the live UI preview.",
          });

          return;
        }

        try {
          if (showRefresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          const response =
            await adminFetch(
              API_URL,
              {
                method: "GET",

                headers: {
                  Authorization:
                    `Bearer ${token}`,

                  "Content-Type":
                    "application/json",
                },
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data?.message ||
                "Failed to fetch learning requests"
            );
          }

          setRequests(
            Array.isArray(
              data.requests
            )
              ? data.requests
              : []
          );
        } catch (error) {
          console.error(
            "Fetch learning requests error:",
            error
          );

          setRequests(STATIC_REQUESTS);

          notify?.({
            title:
              "Failed to load learning requests",
            subtitle:
              "Showing demo data instead.",
          });
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [notify]
    );

  /* ===================================================
     INITIAL LOAD
  =================================================== */

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  /* ===================================================
     AUTO REFRESH
  =================================================== */

  useEffect(() => {
    const interval =
      setInterval(() => {
        fetchRequests(true);
      }, 10000);

    return () =>
      clearInterval(interval);
  }, [fetchRequests]);

  /* ===================================================
     STATISTICS
  =================================================== */

  const stats = useMemo(() => {
    return {
      total:
        requests.length,

      pending:
        requests.filter(
          (request) =>
            request.status ===
            "Open"
        ).length,

      approved:
        requests.filter(
          (request) =>
            request.status ===
            "Accepted"
        ).length,

      rejected:
        requests.filter(
          (request) =>
            request.status ===
            "Cancelled"
        ).length,
    };
  }, [requests]);

  /* ===================================================
     SEARCH
  =================================================== */

  const filteredRequests =
    useMemo(() => {
      const search =
        query
          .trim()
          .toLowerCase();

      if (!search) {
        return requests;
      }

      return requests.filter(
        (request) => {
          const student =
            request
              .requestedBy
              ?.name ||
            "";

          const email =
            request
              .requestedBy
              ?.email ||
            "";

          const subject =
            request.subject ||
            "";

          const title =
            request.title ||
            "";

          const status =
            request.status ||
            "";

          return [
            student,
            email,
            subject,
            title,
            status,
          ]
            .join(" ")
            .toLowerCase()
            .includes(search);
        }
      );
    }, [requests, query]);

  /* ===================================================
     ADMIN APPROVE
  =================================================== */

  const approveRequest =
    async (request) => {
      const token =
        getToken();

      if (!token) {
        setRequests((previous) =>
          previous.map((item) =>
            item._id === request._id
              ? { ...item, status: "Accepted" }
              : item
          )
        );

        notify?.({
          title:
            "Request approved",
          subtitle:
            `${request.requestedBy?.name || "Student"} — ${request.subject}`,
        });

        return;
      }

      try {
        setActionId(
          request._id
        );

        const response =
          await adminFetch(
            `${API_URL}/${request._id}/admin-approve`,
            {
              method: "POST",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to approve request"
          );
        }

        /*
          Update the row immediately using
          the object returned by MongoDB.
        */

        if (data.request) {
          setRequests(
            (previous) =>
              previous.map(
                (item) =>
                  item._id ===
                  request._id
                    ? data.request
                    : item
              )
          );
        } else {
          await fetchRequests(
            true
          );
        }

        notify?.({
          title:
            "Request approved",
          subtitle:
            `${request.requestedBy?.name || "Student"} — ${request.subject}`,
        });
      } catch (error) {
        console.error(
          "Approve request error:",
          error
        );

        setRequests((previous) =>
          previous.map((item) =>
            item._id === request._id
              ? { ...item, status: "Accepted" }
              : item
          )
        );

        notify?.({
          title:
            "Approval failed",
          subtitle:
            "Using local demo update instead.",
        });
      } finally {
        setActionId(null);
      }
    };

  /* ===================================================
     ADMIN REJECT
  =================================================== */

  const rejectRequest =
    async (request) => {
      const token =
        getToken();

      if (!token) {
        setRequests((previous) =>
          previous.map((item) =>
            item._id === request._id
              ? { ...item, status: "Cancelled" }
              : item
          )
        );

        notify?.({
          title:
            "Request rejected",
          subtitle:
            `${request.requestedBy?.name || "Student"} — ${request.subject}`,
        });

        return;
      }

      try {
        setActionId(
          request._id
        );

        const response =
          await adminFetch(
            `${API_URL}/${request._id}/admin-reject`,
            {
              method: "POST",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to reject request"
          );
        }

        /*
          Update the row immediately.
        */

        if (data.request) {
          setRequests(
            (previous) =>
              previous.map(
                (item) =>
                  item._id ===
                  request._id
                    ? data.request
                    : item
              )
          );
        } else {
          await fetchRequests(
            true
          );
        }

        notify?.({
          title:
            "Request rejected",
          subtitle:
            `${request.requestedBy?.name || "Student"} — ${request.subject}`,
        });
      } catch (error) {
        console.error(
          "Reject request error:",
          error
        );

        setRequests((previous) =>
          previous.map((item) =>
            item._id === request._id
              ? { ...item, status: "Cancelled" }
              : item
          )
        );

        notify?.({
          title:
            "Rejection failed",
          subtitle:
            "Using local demo update instead.",
        });
      } finally {
        setActionId(null);
      }
    };

  /* ===================================================
     STATUS DISPLAY
  =================================================== */

  const getStatusDetails = (
    status
  ) => {
    switch (status) {
      case "Accepted":
        return {
          label: "Approved",

          className:
            "bg-emerald-50 text-emerald-600",

          dot:
            "bg-emerald-500",
        };

      case "Cancelled":
        return {
          label: "Rejected",

          className:
            "bg-red-50 text-red-600",

          dot:
            "bg-red-500",
        };

      case "Open":
      default:
        return {
          label: "Pending",

          className:
            "bg-amber-50 text-amber-600",

          dot:
            "bg-amber-500",
        };
    }
  };

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <div>

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex items-start justify-between gap-4">

        <SectionHeader
          title="Learning Requests"
          subtitle="Review real student requests from the CampusConnect database."
        />

        <button
          type="button"
          onClick={() =>
            fetchRequests(true)
          }
          disabled={
            refreshing
          }
          className="
            mt-1
            flex
            items-center
            gap-2
            rounded-full
            border
            border-slate-200
            bg-white
            px-4
            py-2
            text-sm
            font-medium
            text-slate-700
            transition
            hover:bg-slate-50
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          <RefreshCw
            size={16}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>

      </div>

      {/* =================================================
          STAT CARDS
      ================================================= */}

      <div className="mt-5 grid grid-cols-2 gap-5 lg:grid-cols-4">

        <StatCard
          icon={UserRoundCheck}
          label="Total requests"
          value={stats.total}
          tint="bg-blue-50 text-blue-600"
        />

        <StatCard
          icon={Clock}
          label="Pending"
          value={stats.pending}
          tint="bg-amber-50 text-amber-600"
        />

        <StatCard
          icon={CheckCircle2}
          label="Approved"
          value={stats.approved}
          tint="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          icon={XCircle}
          label="Rejected"
          value={stats.rejected}
          tint="bg-red-50 text-red-600"
        />

      </div>

      {/* =================================================
          REQUEST TABLE
      ================================================= */}

      <div
        className={`
          mt-6
          overflow-hidden
          rounded-2xl
          border
          border-slate-100
          bg-white
          ${cardShadowCls}
        `}
      >

        {/* SEARCH */}

        <div className="p-5">

          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search real student requests..."
          />

        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead>

              <tr className="border-y border-slate-200 text-left text-slate-500">

                <th className="px-5 py-3 font-medium">
                  Student
                </th>

                <th className="px-5 py-3 font-medium">
                  Subject
                </th>

                <th className="px-5 py-3 font-medium">
                  Requested on
                </th>

                <th className="px-5 py-3 font-medium">
                  Status
                </th>

                <th className="px-5 py-3 text-right font-medium">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {/* =================================================
                  LOADING
              ================================================= */}

              {loading &&
                Array.from({
                  length: 5,
                }).map(
                  (_, index) => (
                    <tr
                      key={
                        `loading-${index}`
                      }
                      className="border-b border-slate-200"
                    >
                      <td
                        colSpan={5}
                        className="px-5 py-4"
                      >
                        <div className="h-8 animate-pulse rounded-xl bg-slate-100" />
                      </td>
                    </tr>
                  )
                )}

              {/* =================================================
                  DATA
              ================================================= */}

              {!loading &&
                filteredRequests.map(
                  (
                    request,
                    index
                  ) => {
                    const studentName =
                      request
                        .requestedBy
                        ?.name ||
                      "Unknown student";

                    const studentEmail =
                      request
                        .requestedBy
                        ?.email ||
                      "";

                    const studentId =
                      request
                        .requestedBy
                        ?.studentId ||
                      "";

                    const requestDate =
                      request.createdAt;

                    const status =
                      getStatusDetails(
                        request.status
                      );

                    const working =
                      actionId ===
                      request._id;

                    return (
                      <tr
                        key={
                          request._id
                        }
                        className="border-b border-slate-200 last:border-0"
                      >

                        {/* =========================================
                            STUDENT
                        ========================================= */}

                        <td className="px-5 py-3">

                          <div className="flex items-center gap-2.5">

                            <div
                              className={`
                                flex
                                h-8
                                w-8
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                text-xs
                                font-semibold
                                text-white
                                ${
                                  AVATAR_COLORS[
                                    index %
                                      AVATAR_COLORS.length
                                  ]
                                }
                              `}
                            >
                              {initials(
                                studentName
                              )}
                            </div>

                            <div className="min-w-0">

                              <p className="font-medium text-slate-800">
                                {studentName}
                              </p>

                              {studentId ? (
                                <p className="text-xs text-slate-400">
                                  {studentId}
                                </p>
                              ) : (
                                <p className="max-w-[230px] truncate text-xs text-slate-400">
                                  {
                                    studentEmail
                                  }
                                </p>
                              )}

                            </div>

                          </div>

                        </td>

                        {/* =========================================
                            SUBJECT
                        ========================================= */}

                        <td className="px-5 py-3">

                          <div>

                            <p className="font-medium text-slate-700">
                              {request.subject ||
                                "—"}
                            </p>

                            {request.title && (
                              <p className="max-w-[250px] truncate text-xs text-slate-400">
                                {
                                  request.title
                                }
                              </p>
                            )}

                          </div>

                        </td>

                        {/* =========================================
                            DATE
                        ========================================= */}

                        <td className="px-5 py-3 text-slate-600">
                          {formatDate(
                            requestDate
                          )}
                        </td>

                        {/* =========================================
                            STATUS
                        ========================================= */}

                        <td className="px-5 py-3">

                          <span
                            className={`
                              inline-flex
                              items-center
                              gap-1.5
                              rounded-full
                              px-2.5
                              py-1
                              text-xs
                              font-medium
                              ${status.className}
                            `}
                          >

                            <span
                              className={`
                                h-1.5
                                w-1.5
                                rounded-full
                                ${status.dot}
                              `}
                            />

                            {status.label}

                          </span>

                        </td>

                        {/* =========================================
                            ACTIONS
                        ========================================= */}

                        <td className="px-5 py-3">

                          {request.status ===
                          "Open" ? (
                            <div className="flex items-center justify-end gap-1.5">

                              {/* APPROVE */}

                              <button
                                type="button"
                                disabled={
                                  working
                                }
                                onClick={() =>
                                  approveRequest(
                                    request
                                  )
                                }
                                className="
                                  flex
                                  items-center
                                  gap-1
                                  rounded-full
                                  bg-emerald-600
                                  px-3
                                  py-1.5
                                  text-xs
                                  font-medium
                                  text-white
                                  shadow-[0_2px_8px_rgba(5,150,105,0.28)]
                                  transition
                                  hover:bg-emerald-700
                                  disabled:cursor-not-allowed
                                  disabled:opacity-60
                                "
                              >

                                <Check
                                  size={13}
                                />

                                {working
                                  ? "Saving..."
                                  : "Approve"}

                              </button>

                              {/* REJECT */}

                              <button
                                type="button"
                                disabled={
                                  working
                                }
                                onClick={() =>
                                  rejectRequest(
                                    request
                                  )
                                }
                                className="
                                  flex
                                  items-center
                                  gap-1
                                  rounded-full
                                  border
                                  border-red-200
                                  px-3
                                  py-1.5
                                  text-xs
                                  font-medium
                                  text-red-600
                                  transition-colors
                                  hover:bg-red-50
                                  disabled:cursor-not-allowed
                                  disabled:opacity-60
                                "
                              >

                                <X
                                  size={13}
                                />

                                Reject

                              </button>

                            </div>
                          ) : (
                            <p className="text-right text-xs text-slate-400">
                              No action needed
                            </p>
                          )}

                        </td>

                      </tr>
                    );
                  }
                )}

              {/* =================================================
                  EMPTY
              ================================================= */}

              {!loading &&
                filteredRequests.length ===
                  0 && (
                  <tr>

                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center"
                    >

                      <UserRoundCheck
                        size={32}
                        className="mx-auto text-slate-300"
                      />

                      <p className="mt-3 font-medium text-slate-600">
                        No learning requests found
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        New student requests will appear here
                        automatically.
                      </p>

                    </td>

                  </tr>
                )}

            </tbody>

          </table>

        </div>

      </div>
    </div>
  );
}