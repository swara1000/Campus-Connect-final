import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Layers,
  GraduationCap,
  Pencil,
  Trash2,
  Plus,
  FileText,
} from "lucide-react";

import {
  SectionHeader,
  SearchBar,
  Modal,
  Field,
  Select,
  ConfirmDialog,
  StatCard,
} from "./Shared";

import { SEMESTER_OPTIONS } from "../data/mockData";

import {
  formatDate,
  inputCls,
  cardShadowCls,
  secondaryBtnCls,
  primaryBtnCls,
} from "../utils";

const API_URL = "http://localhost:5000/api/study-materials";

/* =====================================================
   MATERIAL FORM
===================================================== */

function MaterialForm({ initial, onCancel, onSubmit }) {
  const [form, setForm] = useState(
    initial || {
      title: "",
      subject: "",
      semester: "5",
      type: "Notes",
      summary: "",
      fileName: "",
    }
  );

  const [file, setFile] = useState(null);

  const set = (key) => (e) => {
    setForm({
      ...form,
      [key]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.subject.trim()) {
      return;
    }

    onSubmit({
      ...form,
      fileName:
        file?.name ||
        form.fileName ||
        "No file",
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Field label="Material title">
        <input
          className={inputCls}
          value={form.title}
          onChange={set("title")}
          placeholder="e.g. DBMS Notes"
          required
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Subject">
          <input
            className={inputCls}
            value={form.subject}
            onChange={set("subject")}
            placeholder="e.g. DBMS"
            required
          />
        </Field>

        <Field label="Semester">
          <Select
            value={form.semester}
            onChange={set("semester")}
          >
            {SEMESTER_OPTIONS.map((semester) => (
              <option
                key={semester}
                value={semester}
              >
                Semester {semester}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Material type">
          <Select
            value={form.type || "Notes"}
            onChange={set("type")}
          >
            <option value="Notes">
              Notes
            </option>

            <option value="PYQ">
              PYQ
            </option>

            <option value="Assignment">
              Assignment
            </option>
          </Select>
        </Field>
      </div>

      <Field label="Summary">
        <textarea
          className={`${inputCls} min-h-[90px]`}
          value={form.summary || ""}
          onChange={set("summary")}
          placeholder="Short description about this material..."
        />
      </Field>

      <Field label="Upload file">
        <input
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx"
          onChange={(e) =>
            setFile(
              e.target.files?.[0] || null
            )
          }
          className="
            w-full
            rounded-xl
            border
            border-slate-300
            px-3
            py-2
            text-sm
            text-slate-600
            shadow-[0_1px_3px_rgba(15,23,42,0.12)]
            file:mr-3
            file:rounded-full
            file:border-0
            file:bg-blue-50
            file:px-3
            file:py-1.5
            file:text-sm
            file:font-medium
            file:text-blue-700
            hover:file:bg-blue-100
          "
        />

        {form.fileName && !file && (
          <p className="mt-1.5 text-xs text-slate-400">
            Current file: {form.fileName}
          </p>
        )}

        {file && (
          <p className="mt-1.5 text-xs text-blue-600">
            Selected: {file.name}
          </p>
        )}
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
            : "Upload material"}
        </button>
      </div>
    </form>
  );
}

/* =====================================================
   STUDY MATERIAL PAGE
===================================================== */

export default function StudyMaterials({
  notify,
}) {
  const [materials, setMaterials] =
    useState([]);

  const [query, setQuery] =
    useState("");

  const [modal, setModal] =
    useState(null);

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  /* =====================================================
     NOTIFICATION HELPER
  ===================================================== */

  const showNotification = (
    notification
  ) => {
    if (typeof notify === "function") {
      notify(notification);
    }
  };

  /* =====================================================
     GET MATERIALS FROM BACKEND
  ===================================================== */

  const fetchMaterials = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        API_URL
      );

      const data =
        await response.json();

      console.log(
        "Study materials:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load study materials"
        );
      }

      if (data.success) {
        const formatted =
          data.materials.map(
            (material) => ({
              ...material,

              id:
                material._id ||
                material.id,

              uploaded:
                material.createdAt ||
                material.uploaded,
            })
          );

        setMaterials(formatted);
      }
    } catch (error) {
      console.error(
        "Fetch study materials error:",
        error
      );

      showNotification({
        title:
          "Unable to load materials",
        subtitle: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     FETCH ON PAGE LOAD
  ===================================================== */

  useEffect(() => {
    fetchMaterials();
  }, []);

  /* =====================================================
     STATISTICS
  ===================================================== */

  const stats = useMemo(
    () => ({
      total: materials.length,

      subjects: new Set(
        materials.map(
          (material) =>
            material.subject
        )
      ).size,

      semesters: new Set(
        materials.map(
          (material) =>
            material.semester
        )
      ).size,
    }),
    [materials]
  );

  /* =====================================================
     SEARCH
  ===================================================== */

  const filtered = useMemo(() => {
    const q = query
      .trim()
      .toLowerCase();

    if (!q) {
      return materials;
    }

    return materials.filter(
      (material) =>
        [
          material.title,
          material.subject,
          material.semester,
          material.fileName,
          material.type,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
    );
  }, [materials, query]);

  /* =====================================================
     CREATE MATERIAL
  ===================================================== */

  const handleCreate = async (
    form
  ) => {
    try {
      console.log(
        "Creating material:",
        form
      );

      const response = await fetch(
        API_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            title:
              form.title.trim(),

            subject:
              form.subject.trim(),

            semester:
              String(form.semester),

            type:
              form.type ||
              "Notes",

            summary:
              form.summary || "",

            fileName:
              form.fileName || "",

            fileUrl: "",
          }),
        }
      );

      const data =
        await response.json();

      console.log(
        "Create material response:",
        data
      );

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to upload material"
        );
      }

      setModal(null);

      await fetchMaterials();

      showNotification({
        title: "Material uploaded",
        subtitle: form.title,
      });
    } catch (error) {
      console.error(
        "Create material error:",
        error
      );

      showNotification({
        title: "Upload failed",
        subtitle: error.message,
      });
    }
  };

  /* =====================================================
     UPDATE MATERIAL
  ===================================================== */

  const handleEdit = async (
    form
  ) => {
    try {
      if (!modal?.material) {
        return;
      }

      const materialId =
        modal.material._id ||
        modal.material.id;

      const response = await fetch(
        `${API_URL}/${materialId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            title:
              form.title.trim(),

            subject:
              form.subject.trim(),

            semester:
              String(form.semester),

            type:
              form.type ||
              "Notes",

            summary:
              form.summary || "",

            fileName:
              form.fileName || "",
          }),
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to update material"
        );
      }

      setModal(null);

      await fetchMaterials();

      showNotification({
        title: "Material updated",
        subtitle: form.title,
      });
    } catch (error) {
      console.error(
        "Update material error:",
        error
      );

      showNotification({
        title: "Update failed",
        subtitle: error.message,
      });
    }
  };

  /* =====================================================
     DELETE MATERIAL
  ===================================================== */

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      const materialId =
        deleteTarget._id ||
        deleteTarget.id;

      const response = await fetch(
        `${API_URL}/${materialId}`,
        {
          method: "DELETE",
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to delete material"
        );
      }

      setDeleteTarget(null);

      await fetchMaterials();

      showNotification({
        title: "Material deleted",
        subtitle:
          deleteTarget.title,
      });
    } catch (error) {
      console.error(
        "Delete material error:",
        error
      );

      showNotification({
        title: "Delete failed",
        subtitle: error.message,
      });
    }
  };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div>
      <SectionHeader
        title="Study Materials"
        subtitle="Upload, organize and manage learning resources available to students."
        action={{
          label: "Upload material",

          icon: <Plus size={16} />,

          onClick: () =>
            setModal({
              mode: "create",
            }),
        }}
      />

      {/* STATS */}

      <div className="mt-5 grid grid-cols-2 gap-5 lg:grid-cols-3">
        <StatCard
          icon={BookOpen}
          label="Total materials"
          value={stats.total}
          tint="bg-blue-50 text-blue-600"
        />

        <StatCard
          icon={Layers}
          label="Subjects covered"
          value={stats.subjects}
          tint="bg-purple-50 text-purple-600"
        />

        <StatCard
          icon={GraduationCap}
          label="Semesters covered"
          value={stats.semesters}
          tint="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* MATERIAL TABLE */}

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
        <div className="p-5">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search materials..."
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-slate-200 text-left text-slate-500">
                <th className="px-5 py-3 font-medium">
                  Title
                </th>

                <th className="px-5 py-3 font-medium">
                  Subject
                </th>

                <th className="px-5 py-3 font-medium">
                  Semester
                </th>

                <th className="px-5 py-3 font-medium">
                  Type
                </th>

                <th className="px-5 py-3 font-medium">
                  File
                </th>

                <th className="px-5 py-3 font-medium">
                  Uploaded
                </th>

                <th className="px-5 py-3 text-right font-medium">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-slate-400"
                  >
                    Loading materials...
                  </td>
                </tr>
              )}

              {!loading &&
                filtered.map(
                  (material) => (
                    <tr
                      key={
                        material._id ||
                        material.id
                      }
                      className="border-b border-slate-200 last:border-0"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                            <FileText
                              size={14}
                            />
                          </div>

                          <span className="font-medium text-slate-800">
                            {
                              material.title
                            }
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-3 text-slate-600">
                        {
                          material.subject
                        }
                      </td>

                      <td className="px-5 py-3 text-slate-600">
                        Semester{" "}
                        {
                          material.semester
                        }
                      </td>

                      <td className="px-5 py-3 text-slate-600">
                        {material.type ||
                          "Notes"}
                      </td>

                      <td className="px-5 py-3 text-slate-500">
                        {material.fileName ||
                          "No file"}
                      </td>

                      <td className="px-5 py-3 text-slate-600">
                        {material.uploaded
                          ? formatDate(
                              material.uploaded
                            )
                          : "-"}
                      </td>

                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() =>
                              setModal({
                                mode: "edit",
                                material,
                              })
                            }
                            className="rounded-full p-1.5 text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Pencil
                              size={16}
                            />
                          </button>

                          <button
                            onClick={() =>
                              setDeleteTarget(
                                material
                              )
                            }
                            className="rounded-full p-1.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2
                              size={16}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}

              {!loading &&
                filtered.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-10 text-center text-slate-400"
                    >
                      No materials
                      found.
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}

      {modal && (
        <Modal
          title={
            modal.mode ===
            "create"
              ? "Upload study material"
              : "Edit material"
          }
          subtitle={
            modal.mode ===
            "create"
              ? "Visible to eligible students instantly."
              : modal.material
                  .title
          }
          onClose={() =>
            setModal(null)
          }
        >
          <MaterialForm
            initial={
              modal.mode ===
              "edit"
                ? modal.material
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

      {/* DELETE CONFIRMATION */}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this material?"
          message={`"${deleteTarget.title}" will be permanently removed. This can't be undone.`}
          confirmLabel="Delete material"
          onCancel={() =>
            setDeleteTarget(null)
          }
          onConfirm={
            confirmDelete
          }
        />
      )}
    </div>
  );
}