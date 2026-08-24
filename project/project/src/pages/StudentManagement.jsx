import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  Users,
  UserCheck,
  UserX,
  Eye,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { API_BASE_URL } from "../api-config.js";
import { adminFetch } from "../api-client.js";

const API_URL = `${API_BASE_URL}/api`;

function StudentManagement() {
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [selectedStudent, setSelectedStudent] =
    useState(null);

  const [students, setStudents] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =====================================================
  // FETCH STUDENTS FROM BACKEND
  // =====================================================

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await adminFetch(
        `${API_URL}/students`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch students"
        );
      }

      setStudents(
        data.students || []
      );
    } catch (error) {
      console.error(
        "Fetch students error:",
        error
      );

      setError(
        error.message ||
          "Failed to load students"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD STUDENTS WHEN PAGE OPENS
  // =====================================================

  useEffect(() => {
    fetchStudents();
  }, []);

  // =====================================================
  // FILTER STUDENTS
  // =====================================================

  const filteredStudents = useMemo(() => {
    return students.filter(
      (student) => {
        const searchText =
          search.toLowerCase();

        const matchesSearch =
          student.name
            ?.toLowerCase()
            .includes(searchText) ||

          student.email
            ?.toLowerCase()
            .includes(searchText) ||

          student.department
            ?.toLowerCase()
            .includes(searchText) ||

          student.studentId
            ?.toLowerCase()
            .includes(searchText);

        const studentStatus =
          student.status === "active"
            ? "Active"
            : "Inactive";

        const matchesStatus =
          statusFilter === "All" ||
          studentStatus ===
            statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );
  }, [
    students,
    search,
    statusFilter,
  ]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalStudents =
    students.length;

  const activeStudents =
    students.filter(
      (student) =>
        student.status === "active"
    ).length;

  const inactiveStudents =
    students.filter(
      (student) =>
        student.status === "blocked"
    ).length;

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (id) => {
    alert(
      "Delete API is not added yet. The student data is currently read-only."
    );
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-full bg-background p-6 md:p-8 text-foreground">

      {/* HEADER */}

      <div className="mb-8">

        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Administration
        </p>

        <h1 className="mt-1 text-3xl font-bold text-foreground md:text-4xl">
          Student Management
        </h1>

        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          Manage students and monitor their CampusConnect accounts.
        </p>

      </div>

      {/* STAT CARDS */}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">

        {/* TOTAL */}

        <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_12px_30px_-18px_rgba(79,70,229,0.28)]">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-sm font-medium text-muted-foreground">
                Total Students
              </p>

              <h2 className="mt-2 text-3xl font-bold text-foreground">
                {totalStudents}
              </h2>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users size={21} />
            </div>

          </div>

        </div>

        {/* ACTIVE */}

        <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_12px_30px_-18px_rgba(79,70,229,0.28)]">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-sm font-medium text-muted-foreground">
                Active Students
              </p>

              <h2 className="mt-2 text-3xl font-bold text-foreground">
                {activeStudents}
              </h2>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <UserCheck size={21} />
            </div>

          </div>

        </div>

        {/* INACTIVE */}

        <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_12px_30px_-18px_rgba(79,70,229,0.28)]">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-sm font-medium text-muted-foreground">
                Inactive Students
              </p>

              <h2 className="mt-2 text-3xl font-bold text-foreground">
                {inactiveStudents}
              </h2>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <UserX size={21} />
            </div>

          </div>

        </div>

      </div>

      {/* TABLE */}

      <section className="mt-8 rounded-2xl border border-border bg-card shadow-[0_12px_30px_-18px_rgba(79,70,229,0.28)]">

        {/* TABLE HEADER */}

        <div className="border-b border-slate-200 p-6">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <h2 className="text-xl font-bold text-slate-900">
                All Students
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                View registered students from the CampusConnect database.
              </p>

            </div>

            {/* SEARCH */}

            <div className="relative w-full lg:w-80">

              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search students..."
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white"
              />

            </div>

          </div>

          {/* FILTER */}

          <div className="mt-5 flex flex-wrap gap-2">

            {[
              "All",
              "Active",
              "Inactive",
            ].map((status) => (

              <button
                key={status}
                type="button"
                onClick={() =>
                  setStatusFilter(
                    status
                  )
                }
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  statusFilter ===
                  status
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {status}
              </button>

            ))}

          </div>

        </div>

        {/* LOADING */}

        {loading && (

          <div className="px-6 py-16 text-center">

            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="mt-4 text-sm text-slate-500">
              Loading students...
            </p>

          </div>

        )}

        {/* ERROR */}

        {!loading && error && (

          <div className="px-6 py-16 text-center">

            <Users
              size={35}
              className="mx-auto text-red-300"
            />

            <p className="mt-3 font-semibold text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchStudents}
              className="mt-4 rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Retry
            </button>

          </div>

        )}

        {/* TABLE */}

        {!loading &&
          !error && (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px]">

                <thead>

                  <tr className="border-b border-slate-200 bg-slate-50">

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Student
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Department
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Year
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredStudents.length >
                  0 ? (

                    filteredStudents.map(
                      (student) => {

                        const displayStatus =
                          student.status ===
                          "active"
                            ? "Active"
                            : "Inactive";

                        return (

                          <tr
                            key={
                              student._id
                            }
                            className="border-b border-slate-100 transition hover:bg-slate-50"
                          >

                            {/* STUDENT */}

                            <td className="px-6 py-4">

                              <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 font-semibold text-blue-600">

                                  {student.name
                                    ?.split(
                                      " "
                                    )
                                    .map(
                                      (word) =>
                                        word[0]
                                    )
                                    .join(
                                      ""
                                    )
                                    .slice(
                                      0,
                                      2
                                    )}

                                </div>

                                <div>

                                  <p className="font-semibold text-slate-800">
                                    {
                                      student.name
                                    }
                                  </p>

                                  <p className="text-sm text-slate-500">
                                    {
                                      student.email
                                    }
                                  </p>

                                </div>

                              </div>

                            </td>

                            {/* DEPARTMENT */}

                            <td className="px-6 py-4 text-sm text-slate-600">
                              {student.department ||
                                "Not specified"}
                            </td>

                            {/* YEAR */}

                            <td className="px-6 py-4 text-sm text-slate-600">
                              {student.year ||
                                "Not specified"}
                            </td>

                            {/* STATUS */}

                            <td className="px-6 py-4">

                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                  displayStatus ===
                                  "Active"
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-orange-50 text-orange-600"
                                }`}
                              >
                                {
                                  displayStatus
                                }
                              </span>

                            </td>

                            {/* ACTIONS */}

                            <td className="px-6 py-4">

                              <div className="flex justify-end gap-2">

                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedStudent(
                                      student
                                    )
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                                  title="View student"
                                >
                                  <Eye
                                    size={
                                      17
                                    }
                                  />
                                </button>

                                <button
                                  type="button"
                                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                                  title="Edit student"
                                >
                                  <Pencil
                                    size={
                                      17
                                    }
                                  />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(
                                      student._id
                                    )
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                                  title="Delete student"
                                >
                                  <Trash2
                                    size={
                                      17
                                    }
                                  />
                                </button>

                              </div>

                            </td>

                          </tr>

                        );
                      }
                    )

                  ) : (

                    <tr>

                      <td
                        colSpan="5"
                        className="px-6 py-12 text-center"
                      >

                        <Users
                          size={35}
                          className="mx-auto text-slate-300"
                        />

                        <p className="mt-3 font-semibold text-slate-700">
                          No students found
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          No registered students match your search.
                        </p>

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          )}

      </section>

      {/* STUDENT DETAILS */}

      {selectedStudent && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">

          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 p-5">

              <h2 className="text-lg font-bold text-slate-900">
                Student Details
              </h2>

              <button
                type="button"
                onClick={() =>
                  setSelectedStudent(
                    null
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>

            </div>

            {/* CONTENT */}

            <div className="p-6">

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-lg font-bold text-blue-600">

                  {selectedStudent.name
                    ?.split(" ")
                    .map(
                      (word) =>
                        word[0]
                    )
                    .join("")
                    .slice(0, 2)}

                </div>

                <div>

                  <h3 className="text-lg font-bold text-slate-900">
                    {
                      selectedStudent.name
                    }
                  </h3>

                  <p className="text-sm text-slate-500">
                    {
                      selectedStudent.email
                    }
                  </p>

                </div>

              </div>

              <div className="mt-6 space-y-4">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Student ID
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {selectedStudent.studentId ||
                      "Not specified"}
                  </p>

                </div>

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Department
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {selectedStudent.department ||
                      "Not specified"}
                  </p>

                </div>

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Year
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {selectedStudent.year ||
                      "Not specified"}
                  </p>

                </div>

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Status
                  </p>

                  <span
                    className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      selectedStudent.status ===
                      "active"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-orange-50 text-orange-600"
                    }`}
                  >
                    {selectedStudent.status ===
                    "active"
                      ? "Active"
                      : "Inactive"}
                  </span>

                </div>

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Registered On
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {selectedStudent.createdAt
                      ? new Date(
                          selectedStudent.createdAt
                        ).toLocaleString()
                      : "Not available"}
                  </p>

                </div>

              </div>

            </div>

            {/* FOOTER */}

            <div className="flex justify-end border-t border-slate-200 p-5">

              <button
                type="button"
                onClick={() =>
                  setSelectedStudent(
                    null
                  )
                }
                className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default StudentManagement;