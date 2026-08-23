import { createFileRoute } from "@tanstack/react-router";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  Upload,
  Download,
  Star,
  MessageSquare,
  Bookmark,
  FileText,
  FileQuestion,
  ClipboardList,
} from "lucide-react";

import { toast } from "sonner";

import {
  AppShell,
  GlassCard,
} from "@/components/AppShell";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useCampus } from "@/lib/campus-store";

import {
  subjects,
} from "@/lib/learning-data";

import { cn } from "@/lib/utils";
import { API_BASE_URL } from "../lib/api-config.js";

/* =====================================================
   BACKEND API
===================================================== */

const API_URL =
  `${API_BASE_URL}/api/study-materials`;

/* =====================================================
   ROUTE
===================================================== */

export const Route = createFileRoute("/materials")({
  head: () => ({
    meta: [
      {
        title:
          "Study Materials — CampusConnect",
      },
      {
        name: "description",
        content:
          "Browse, search, upload and rate peer-shared notes, previous year questions and assignments.",
      },
      {
        property: "og:title",
        content:
          "Study Materials — CampusConnect",
      },
      {
        property: "og:description",
        content:
          "A shared library of student notes, PYQs and assignment solutions.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
    ],
  }),

  component: MaterialsPage,
});

/* =====================================================
   MATERIAL TYPES
===================================================== */

const typeIcon = {
  Notes: FileText,
  PYQ: FileQuestion,
  Assignment: ClipboardList,
};

const filters = [
  "All",
  "Notes",
  "PYQ",
  "Assignment",
  "Bookmarked",
];

/* =====================================================
   MATERIALS PAGE
===================================================== */

function MaterialsPage() {
  const {
    bookmarks,
    toggleBookmark,
    user,
  } = useCampus();

  const [items, setItems] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [query, setQuery] =
    useState("");

  const [subject, setSubject] =
    useState("All subjects");

  const [filter, setFilter] =
    useState("All");

  const [open, setOpen] =
    useState(false);

  const [active, setActive] =
    useState(null);

  const [comment, setComment] =
    useState("");

  const [form, setForm] =
    useState({
      title: "",
      subject: subjects[0],
      type: "Notes",
      summary: "",
    });

  /* =====================================================
     FETCH MATERIALS FROM BACKEND
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
        "Student Study Materials API:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to fetch study materials"
        );
      }

      if (data.success) {
        const formattedMaterials =
          data.materials.map(
            (material) => ({
              id:
                material._id ||
                material.id,

              title:
                material.title ||
                "Untitled Material",

              subject:
                material.subject ||
                "Other",

              semester:
                material.semester ||
                "",

              type:
                material.type ||
                "Notes",

              author:
                material.uploadedBy ||
                "Admin",

              initials:
                material.uploadedBy
                  ? material.uploadedBy
                      .split(/\s+/)
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) =>
                        part[0]?.toUpperCase()
                      )
                      .join("")
                  : "AD",

              pages:
                material.pages ||
                0,

              size:
                material.size ||
                "",

              rating:
                material.rating ||
                0,

              ratings:
                material.ratings ||
                0,

              downloads:
                material.downloads ||
                0,

              uploaded:
                material.createdAt
                  ? new Date(
                      material.createdAt
                    ).toLocaleDateString()
                  : "",

              status:
                material.status ||
                "approved",

              summary:
                material.summary ||
                `Study material for ${material.subject}`,

              comments:
                Array.isArray(
                  material.comments
                )
                  ? material.comments
                  : [],

              fileName:
                material.fileName ||
                "",

              fileUrl:
                material.fileUrl ||
                "",
            })
          );

        setItems(
          formattedMaterials
        );
      }
    } catch (error) {
      console.error(
        "Student materials fetch error:",
        error
      );

      toast.error(
        "Unable to load study materials"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     LOAD MATERIALS WHEN PAGE OPENS
  ===================================================== */

  useEffect(() => {
    fetchMaterials();
  }, []);

  /* =====================================================
     PDF DOWNLOAD
  ===================================================== */

  const handleDownloadPDF = async (
    material
  ) => {
    try {
      /*
        TEMPORARY:
        Currently every material downloads
        public/sample.pdf.

        Later we will connect this to the
        actual file uploaded by Admin.
      */

      const response =
        await fetch("/sample.pdf");

      if (!response.ok) {
        throw new Error(
          "PDF file not found"
        );
      }

      const blob =
        await response.blob();

      const safeTitle =
        material.title
          .replace(
            /[<>:"/\\|?*]/g,
            ""
          )
          .trim();

      const fileName =
        `${
          safeTitle ||
          "CampusConnect-Material"
        }.pdf`;

      /* =========================================
         SAVE AS DIALOG
      ========================================= */

      if (
        "showSaveFilePicker" in window
      ) {
        const fileHandle =
          await window.showSaveFilePicker(
            {
              suggestedName:
                fileName,

              types: [
                {
                  description:
                    "PDF Document",

                  accept: {
                    "application/pdf":
                      [".pdf"],
                  },
                },
              ],
            }
          );

        const writable =
          await fileHandle.createWritable();

        await writable.write(
          blob
        );

        await writable.close();

        setItems(
          (currentItems) =>
            currentItems.map(
              (item) =>
                item.id ===
                material.id
                  ? {
                      ...item,

                      downloads:
                        (
                          item.downloads ||
                          0
                        ) + 1,
                    }
                  : item
            )
        );

        toast.success(
          `${material.title} saved successfully`
        );

        return;
      }

      /* =========================================
         NORMAL DOWNLOAD FALLBACK
      ========================================= */

      const url =
        URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href = url;
      link.download =
        fileName;

      document.body.appendChild(
        link
      );

      link.click();

      document.body.removeChild(
        link
      );

      URL.revokeObjectURL(
        url
      );

      setItems(
        (currentItems) =>
          currentItems.map(
            (item) =>
              item.id ===
              material.id
                ? {
                    ...item,

                    downloads:
                      (
                        item.downloads ||
                        0
                      ) + 1,
                  }
                : item
          )
      );

      toast.success(
        `${material.title} downloaded successfully`
      );
    } catch (error) {
      if (
        error?.name ===
        "AbortError"
      ) {
        return;
      }

      console.error(
        "PDF download error:",
        error
      );

      toast.error(
        "Unable to download PDF"
      );
    }
  };

  /* =====================================================
     FILTER MATERIALS
  ===================================================== */

  const visible = useMemo(
    () =>
      items.filter((material) => {
        const q = query
          .trim()
          .toLowerCase();

        if (
          q &&
          !`${material.title} ${material.subject} ${material.author}`
            .toLowerCase()
            .includes(q)
        ) {
          return false;
        }

        if (
          subject !==
            "All subjects" &&
          material.subject !==
            subject
        ) {
          return false;
        }

        if (
          filter ===
          "Bookmarked"
        ) {
          return bookmarks.includes(
            material.id
          );
        }

        if (
          filter !== "All" &&
          material.type !==
            filter
        ) {
          return false;
        }

        return true;
      }),

    [
      items,
      query,
      subject,
      filter,
      bookmarks,
    ]
  );

  /* =====================================================
     STUDENT UPLOAD
     CURRENTLY LOCAL ONLY
  ===================================================== */

  const upload = () => {
    if (!form.title.trim()) {
      return;
    }

    const userName =
      user?.name ||
      "Student";

    const initials =
      user?.initials ||
      userName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) =>
          part[0]?.toUpperCase()
        )
        .join("");

    const note = {
      id:
        `nt-${Date.now()}`,

      title:
        form.title.trim(),

      subject:
        form.subject,

      type:
        form.type,

      author:
        userName,

      initials,

      pages: 10,

      size:
        "1.4 MB",

      rating: 0,

      ratings: 0,

      downloads: 0,

      uploaded:
        "Just now",

      status:
        "pending",

      summary:
        form.summary.trim() ||
        "Awaiting admin approval.",

      comments: [],

      fileName: "",

      fileUrl: "",
    };

    setItems(
      (currentItems) => [
        note,
        ...currentItems,
      ]
    );

    setForm({
      title: "",
      subject:
        subjects[0],
      type: "Notes",
      summary: "",
    });

    setOpen(false);

    toast.success(
      "Uploaded — pending admin approval"
    );
  };

  /* =====================================================
     RATE
  ===================================================== */

  const rate = (id) => {
    setItems(
      (currentItems) =>
        currentItems.map(
          (note) =>
            note.id === id
              ? {
                  ...note,

                  ratings:
                    (
                      note.ratings ||
                      0
                    ) + 1,

                  rating:
                    Math.min(
                      5,

                      Number(
                        (
                          (
                            note.rating ||
                            0
                          ) + 0.1
                        ).toFixed(
                          1
                        )
                      )
                    ),
                }
              : note
        )
    );

    toast.success(
      "Thanks for rating"
    );
  };

  /* =====================================================
     ADD COMMENT
  ===================================================== */

  const addComment = () => {
    if (
      !active ||
      !comment.trim()
    ) {
      return;
    }

    const userName =
      user?.name ||
      "Student";

    const initials =
      user?.initials ||
      userName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) =>
          part[0]?.toUpperCase()
        )
        .join("");

    const newComment = {
      id:
        `cm-${Date.now()}`,

      author:
        userName,

      initials,

      body:
        comment.trim(),

      time:
        "Just now",
    };

    setItems(
      (currentItems) =>
        currentItems.map(
          (note) =>
            note.id ===
            active.id
              ? {
                  ...note,

                  comments: [
                    ...(note.comments ||
                      []),

                    newComment,
                  ],
                }
              : note
        )
    );

    setActive(
      (currentActive) =>
        currentActive
          ? {
              ...currentActive,

              comments: [
                ...(
                  currentActive.comments ||
                  []
                ),

                newComment,
              ],
            }
          : currentActive
    );

    setComment("");
  };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <AppShell
      title="Study Materials"

      subtitle="Peer-shared notes, previous year questions and assignments."

      action={
        <Dialog
          open={open}
          onOpenChange={setOpen}
        >
          <DialogTrigger
            asChild
          >
            <Button
              size="sm"
              className="gap-1.5 rounded-xl"
            >
              <Upload className="size-4" />

              <span className="hidden sm:inline">
                Upload notes
              </span>
            </Button>
          </DialogTrigger>

          <DialogContent className="rounded-3xl sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Upload study material
              </DialogTitle>

              <DialogDescription>
                Shared files are
                reviewed by an admin
                before appearing
                publicly.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              {/* TITLE */}

              <div>
                <Label className="text-xs">
                  Title
                </Label>

                <Input
                  value={
                    form.title
                  }

                  onChange={(e) =>
                    setForm({
                      ...form,

                      title:
                        e.target
                          .value,
                    })
                  }

                  placeholder="e.g. Graph algorithms handwritten notes"

                  className="mt-1 rounded-xl"
                />
              </div>

              {/* SUBJECT + TYPE */}

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">
                    Subject
                  </Label>

                  <select
                    value={
                      form.subject
                    }

                    onChange={(e) =>
                      setForm({
                        ...form,

                        subject:
                          e.target
                            .value,
                      })
                    }

                    className="
                      mt-1
                      h-9
                      w-full
                      rounded-xl
                      border
                      border-input
                      bg-card/70
                      px-3
                      text-sm
                    "
                  >
                    {subjects.map(
                      (
                        subjectItem
                      ) => (
                        <option
                          key={
                            subjectItem
                          }
                          value={
                            subjectItem
                          }
                        >
                          {
                            subjectItem
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <Label className="text-xs">
                    Type
                  </Label>

                  <select
                    value={
                      form.type
                    }

                    onChange={(e) =>
                      setForm({
                        ...form,

                        type:
                          e.target
                            .value,
                      })
                    }

                    className="
                      mt-1
                      h-9
                      w-full
                      rounded-xl
                      border
                      border-input
                      bg-card/70
                      px-3
                      text-sm
                    "
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
                  </select>
                </div>
              </div>

              {/* SUMMARY */}

              <div>
                <Label className="text-xs">
                  Short summary
                </Label>

                <Textarea
                  value={
                    form.summary
                  }

                  onChange={(e) =>
                    setForm({
                      ...form,

                      summary:
                        e.target
                          .value,
                    })
                  }

                  rows={3}

                  className="mt-1 rounded-xl"

                  placeholder="What does this cover?"
                />
              </div>

              {/* UPLOAD PLACEHOLDER */}

              <div
                className="
                  rounded-2xl
                  border
                  border-dashed
                  border-border
                  p-6
                  text-center
                  text-sm
                  text-muted-foreground
                "
              >
                <Upload className="mx-auto mb-2 size-5" />

                Drag a PDF here or
                click to browse
              </div>
            </div>

            <DialogFooter>
              <Button
                className="rounded-xl"

                onClick={
                  upload
                }

                disabled={
                  !form.title.trim()
                }
              >
                Publish for review
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="space-y-5">

        {/* =================================================
            SEARCH + FILTERS
        ================================================= */}

        <GlassCard className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_14rem]">
          <div className="relative">
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

              onChange={(e) =>
                setQuery(
                  e.target.value
                )
              }

              placeholder="Search by title, subject or author"

              className="rounded-xl bg-card/70 pl-9"
            />
          </div>

          <select
            value={subject}

            onChange={(e) =>
              setSubject(
                e.target.value
              )
            }

            className="
              h-9
              w-full
              rounded-xl
              border
              border-input
              bg-card/70
              px-3
              text-sm
            "
          >
            <option value="All subjects">
              All subjects
            </option>

            {subjects.map(
              (
                subjectItem
              ) => (
                <option
                  key={
                    subjectItem
                  }
                  value={
                    subjectItem
                  }
                >
                  {
                    subjectItem
                  }
                </option>
              )
            )}
          </select>

          <div className="flex flex-wrap gap-2 lg:col-span-2">
            {filters.map(
              (filterItem) => (
                <button
                  key={
                    filterItem
                  }

                  onClick={() =>
                    setFilter(
                      filterItem
                    )
                  }

                  className={cn(
                    "rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors",

                    filter ===
                      filterItem
                      ? "bg-gradient-brand text-primary-foreground shadow-md shadow-primary/25"
                      : "bg-card/70 text-muted-foreground hover:bg-accent/60"
                  )}
                >
                  {
                    filterItem
                  }
                </button>
              )
            )}
          </div>
        </GlassCard>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <GlassCard className="text-center text-sm text-muted-foreground">
            Loading study materials...
          </GlassCard>
        )}

        {/* =================================================
            MATERIAL CARDS
        ================================================= */}

        {!loading && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visible.map(
              (material) => {
                const Icon =
                  typeIcon[
                    material.type
                  ] || FileText;

                const saved =
                  bookmarks.includes(
                    material.id
                  );

                return (
                  <GlassCard
                    key={
                      material.id
                    }

                    className="
                      flex
                      h-full
                      flex-col
                      transition-transform
                      hover:-translate-y-0.5
                    "
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className="
                          grid
                          size-10
                          shrink-0
                          place-items-center
                          rounded-2xl
                          bg-gradient-brand
                          text-primary-foreground
                        "
                      >
                        <Icon className="size-5" />
                      </span>

                      <div className="flex shrink-0 items-center gap-1">
                        <Badge
                          variant="secondary"

                          className="rounded-lg"
                        >
                          {
                            material.type
                          }
                        </Badge>

                        <Button
                          variant="ghost"

                          size="icon"

                          className="size-8"

                          onClick={() =>
                            toggleBookmark(
                              material.id
                            )
                          }

                          aria-label="Bookmark"
                        >
                          <Bookmark
                            className={cn(
                              "size-4",

                              saved &&
                                "fill-primary text-primary"
                            )}
                          />
                        </Button>
                      </div>
                    </div>

                    <p className="mt-3 line-clamp-2 font-semibold">
                      {
                        material.title
                      }
                    </p>

                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {
                        material.summary
                      }
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        {
                          material.subject
                        }
                      </span>

                      {material.semester && (
                        <span>
                          Semester{" "}
                          {
                            material.semester
                          }
                        </span>
                      )}

                      {material.pages >
                        0 && (
                        <span>
                          {
                            material.pages
                          }{" "}
                          pages
                        </span>
                      )}

                      {material.size && (
                        <span>
                          {
                            material.size
                          }
                        </span>
                      )}
                    </div>

                    {material.fileName && (
                      <p className="mt-2 truncate text-xs text-muted-foreground">
                        File:{" "}
                        {
                          material.fileName
                        }
                      </p>
                    )}

                    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                      <button
                        onClick={() =>
                          rate(
                            material.id
                          )
                        }

                        className="
                          flex
                          items-center
                          gap-1
                          font-medium
                          text-foreground
                          hover:text-primary
                        "
                      >
                        <Star
                          className="
                            size-3.5
                            fill-[var(--warning,#f59e0b)]
                            text-[var(--warning,#f59e0b)]
                          "
                        />

                        {material.rating ||
                          "—"}{" "}

                        (
                        {
                          material.ratings
                        }
                        )
                      </button>

                      <span className="flex items-center gap-1">
                        <Download className="size-3.5" />

                        {material.downloads ||
                          0}
                      </span>

                      <span className="flex items-center gap-1">
                        <MessageSquare className="size-3.5" />

                        {
                          (
                            material.comments ||
                            []
                          ).length
                        }
                      </span>
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
                      <Button
                        variant="outline"

                        size="sm"

                        className="rounded-xl bg-card/60"

                        onClick={() =>
                          setActive(
                            material
                          )
                        }
                      >
                        Details
                      </Button>

                      <Button
                        size="sm"

                        className="gap-1.5 rounded-xl"

                        onClick={() =>
                          handleDownloadPDF(
                            material
                          )
                        }
                      >
                        <Download className="size-3.5" />

                        PDF
                      </Button>
                    </div>
                  </GlassCard>
                );
              }
            )}

            {visible.length ===
              0 && (
              <GlassCard className="md:col-span-2 xl:col-span-3 text-sm text-muted-foreground">
                No materials match
                your filters.
              </GlassCard>
            )}
          </div>
        )}
      </div>

      {/* =================================================
          DETAILS DIALOG
      ================================================= */}

      <Dialog
        open={!!active}

        onOpenChange={(dialogOpen) => {
          if (!dialogOpen) {
            setActive(null);
            setComment("");
          }
        }}
      >
        <DialogContent className="rounded-3xl sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="pr-6">
              {active?.title}
            </DialogTitle>

            <DialogDescription>
              {active?.subject}

              {active?.semester &&
                ` · Semester ${active.semester}`}

              {" · uploaded by "}

              {active?.author}

              {active?.uploaded &&
                ` · ${active.uploaded}`}
            </DialogDescription>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            {active?.summary}
          </p>

          {active?.fileName && (
            <div className="rounded-xl border bg-muted/30 px-3 py-2 text-sm">
              <span className="font-medium">
                File:
              </span>{" "}
              {
                active.fileName
              }
            </div>
          )}

          <div className="max-h-56 space-y-3 overflow-y-auto">
            {(
              active?.comments ||
              []
            ).map(
              (commentItem) => (
                <div
                  key={
                    commentItem.id ||
                    commentItem._id
                  }

                  className="flex gap-3"
                >
                  <span
                    className="
                      grid
                      size-8
                      shrink-0
                      place-items-center
                      rounded-full
                      bg-gradient-brand
                      text-[10px]
                      font-bold
                      text-primary-foreground
                    "
                  >
                    {
                      commentItem.initials ||
                      "ST"
                    }
                  </span>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold">
                      {
                        commentItem.author ||
                        "Student"
                      }{" "}

                      ·{" "}

                      <span className="font-normal text-muted-foreground">
                        {
                          commentItem.time ||
                          ""
                        }
                      </span>
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {
                        commentItem.body
                      }
                    </p>
                  </div>
                </div>
              )
            )}

            {(
              active?.comments ||
              []
            ).length ===
              0 && (
              <p className="text-sm text-muted-foreground">
                No comments yet.
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Input
              value={comment}

              onChange={(e) =>
                setComment(
                  e.target.value
                )
              }

              placeholder="Add a comment"

              className="rounded-xl bg-card/70"
            />

            <Button
              className="rounded-xl"

              onClick={
                addComment
              }

              disabled={
                !comment.trim()
              }
            >
              Post
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}