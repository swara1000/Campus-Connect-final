import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Radio,
  Video,
  MapPin,
  Clock,
  Check,
  X,
  MessageSquare,
  Plus,
} from "lucide-react";

import { toast } from "sonner";

import {
  AppShell,
  GlassCard,
} from "@/components/AppShell";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

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
import { subjects } from "@/lib/learning-data";
import { cn } from "@/lib/utils";

const API_URL =
  "http://localhost:5000/api/peer-learning";

const CHAT_API_URL =
  "http://localhost:5000/api/chat";

export const Route =
  createFileRoute("/peer-learning")({
    head: () => ({
      meta: [
        {
          title:
            "Peer Learning — CampusConnect",
        },
        {
          name: "description",
          content:
            "Broadcast learning requests, accept peer sessions and start a private chat instantly.",
        },
      ],
    }),

    component:
      PeerLearningPage,
  });

const tabs = [
  "Incoming",
  "My requests",
  "Matches",
];

function PeerLearningPage() {
  const navigate =
    useNavigate();

  const { user } =
    useCampus();

  const [items, setItems] =
    useState([]);

  const [tab, setTab] =
    useState("Incoming");

  const [mode, setMode] =
    useState("All");

  const [subject, setSubject] =
    useState("All subjects");

  const [open, setOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [
    declinedIds,
    setDeclinedIds,
  ] = useState([]);

  const [
    openingChatId,
    setOpeningChatId,
  ] = useState(null);

  const [form, setForm] =
    useState({
      subject:
        subjects[0] ||
        "General",

      topic: "",

      description: "",

      preferredTime: "",

      mode: "Online",

      skillLevel:
        "Beginner",
    });

  /* =====================================================
     TOKEN
  ===================================================== */

  const getToken = () =>
    localStorage.getItem(
      "campusconnect_token"
    );

  /* =====================================================
     CURRENT USER ID
  ===================================================== */

  const getLoggedInUserId = () => {
  // First try campus store
  if (user?._id) return String(user._id);
  if (user?.id) return String(user.id);

  // Then try stored login user
  try {
    const storedUser = JSON.parse(
      localStorage.getItem("campusconnect_user") || "{}"
    );

    return String(
      storedUser?._id ||
      storedUser?.id ||
      ""
    );
  } catch (error) {
    console.error("Unable to read logged in user:", error);
    return "";
  }
};

const currentUserId = getLoggedInUserId();

  /* =====================================================
     FETCH REQUESTS
  ===================================================== */

  const fetchRequests =
    async () => {
      try {
        setLoading(true);

        const token =
          getToken();

        if (!token) {
          toast.error(
            "Please login again."
          );
          return;
        }

        const response =
          await fetch(
            API_URL,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          toast.error(
            data.message ||
              "Failed to load peer learning requests"
          );

          return;
        }

        const formatted =
          (
            data.requests ||
            []
          ).map(
            (request) => {
              const requester =
                request.requestedBy;

              const accepter =
                request.acceptedBy;

              return {
                id:
                  request._id,

                studentId:
                  requester?._id ||
                  requester,

                student:
                  requester?.name ||
                  "Student",

                initials:
                  getInitials(
                    requester?.name
                  ),

                email:
                  requester?.email ||
                  "",

                department:
                  requester?.department ||
                  "",

                year:
                  requester?.year ||
                  "",

                subject:
                  request.subject,

                topic:
                  request.title,

                description:
                  request.description ||
                  "Looking for a study partner.",

                preferredTime:
                  request.preferredTime ||
                  "Flexible",

                mode:
                  request.preferredMode ||
                  "Either",

                skillLevel:
                  request.skillLevel ||
                  "Beginner",

                status:
                  request.status,

                acceptedById:
                  accepter?._id ||
                  accepter ||
                  null,

                acceptedByName:
                  accepter?.name ||
                  "",

                posted:
                  formatPostedTime(
                    request.createdAt
                  ),
              };
            }
          );

        setItems(
          formatted
        );
      } catch (error) {
        console.error(
          "Peer learning fetch error:",
          error
        );

        toast.error(
          "Cannot connect to backend."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchRequests();
  }, []);

  /* =====================================================
     MY REQUESTS
  ===================================================== */

  const mine =
    items.filter(
      (request) =>
        String(
          request.studentId
        ) ===
        String(
          currentUserId
        )
    );

  /* =====================================================
     INCOMING REQUESTS
  ===================================================== */

  const incoming =
    items.filter(
      (request) =>
        String(
          request.studentId
        ) !==
        String(
          currentUserId
        ) &&
        request.status ===
          "Open" &&
        !declinedIds.includes(
          request.id
        )
    );

  /* =====================================================
     MATCHES
  ===================================================== */

  const matches =
    items.filter(
      (request) =>
        request.status ===
          "Accepted" &&
        (
          String(
            request.studentId
          ) ===
            String(
              currentUserId
            ) ||
          String(
            request.acceptedById
          ) ===
            String(
              currentUserId
            )
        )
    );

  /* =====================================================
     FILTER LIST
  ===================================================== */

  const list =
    useMemo(() => {
      let base = [];

      if (
        tab ===
        "My requests"
      ) {
        base = mine;
      } else if (
        tab === "Matches"
      ) {
        base = matches;
      } else {
        base = incoming;
      }

      return base.filter(
        (request) => {
          if (
            mode !==
              "All" &&
            request.mode !==
              mode
          ) {
            return false;
          }

          if (
            subject !==
              "All subjects" &&
            request.subject !==
              subject
          ) {
            return false;
          }

          return true;
        }
      );
    }, [
      tab,
      mine,
      matches,
      incoming,
      mode,
      subject,
    ]);

  /* =====================================================
     CREATE REQUEST
  ===================================================== */

  const broadcast =
    async () => {
      if (
        !form.topic.trim()
      ) {
        return;
      }

      try {
        const token =
          getToken();

        if (!token) {
          toast.error(
            "Please login again."
          );
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

              body:
                JSON.stringify({
                  title:
                    form.topic.trim(),

                  subject:
                    form.subject,

                  description:
                    form.description.trim() ||
                    "Looking for a study partner.",

                  skillLevel:
                    form.skillLevel,

                  preferredMode:
                    form.mode,

                  preferredTime:
                    form.preferredTime ||
                    "Flexible",
                }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          toast.error(
            data.message ||
              "Failed to create request"
          );

          return;
        }

        setForm({
          subject:
            subjects[0] ||
            "General",

          topic: "",

          description:
            "",

          preferredTime:
            "",

          mode:
            "Online",

          skillLevel:
            "Beginner",
        });

        setOpen(false);

        setTab(
          "My requests"
        );

        toast.success(
          "Request broadcast to all students"
        );

        await fetchRequests();
      } catch (error) {
        console.error(
          "Create request error:",
          error
        );

        toast.error(
          "Cannot connect to backend."
        );
      }
    };

  /* =====================================================
     ACCEPT REQUEST
  ===================================================== */

  const onAccept =
    async (request) => {
      try {
        const token =
          getToken();

        if (!token) {
          toast.error(
            "Please login again."
          );

          return;
        }

        const response =
          await fetch(
            `${API_URL}/${request.id}/accept`,
            {
              method: "POST",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          toast.error(
            data.message ||
              "Unable to accept request"
          );

          return;
        }

        toast.success(
          `Matched with ${request.student}`
        );

        await fetchRequests();

        setTab(
          "Matches"
        );
      } catch (error) {
        console.error(
          "Accept request error:",
          error
        );

        toast.error(
          "Cannot connect to backend."
        );
      }
    };

  /* =====================================================
     OPEN PRIVATE CHAT
  ===================================================== */

  const openPeerChat =
    async (request) => {
      try {
        const token =
          getToken();

        if (!token) {
          toast.error(
            "Please login again."
          );
          return;
        }

        setOpeningChatId(
          request.id
        );

        const response =
          await fetch(
            `${CHAT_API_URL}/peer-learning/${request.id}`,
            {
              method: "POST",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          toast.error(
            data.message ||
              "Unable to open private chat"
          );
          return;
        }

        const conversationId =
          data.conversation?._id;

        if (!conversationId) {
          toast.error(
            "Conversation ID not returned."
          );
          return;
        }

        navigate({
          to: "/chat",
          search: {
            conversationId,
          },
        });
      } catch (error) {
        console.error(
          "Open peer chat error:",
          error
        );

        toast.error(
          "Cannot connect to chat backend."
        );
      } finally {
        setOpeningChatId(
          null
        );
      }
    };

  /* =====================================================
     CANCEL OWN REQUEST
  ===================================================== */

  const cancelRequest =
    async (request) => {
      try {
        const token =
          getToken();

        if (!token) {
          toast.error(
            "Please login again."
          );

          return;
        }

        const response =
          await fetch(
            `${API_URL}/${request.id}/cancel`,
            {
              method:
                "PATCH",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          toast.error(
            data.message ||
              "Unable to cancel request"
          );

          return;
        }

        toast.success(
          "Request cancelled"
        );

        await fetchRequests();
      } catch (error) {
        console.error(
          "Cancel request error:",
          error
        );

        toast.error(
          "Cannot connect to backend."
        );
      }
    };

  /* =====================================================
     DECLINE INCOMING
  ===================================================== */

  const declineIncoming =
    (request) => {
      setDeclinedIds(
        (previous) => [
          ...previous,
          request.id,
        ]
      );

      toast(
        "Request dismissed"
      );
    };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <AppShell
      title="Peer Learning"
      subtitle="Broadcast what you need help with — get matched with a peer."
      action={
        <Dialog
          open={open}
          onOpenChange={
            setOpen
          }
        >
          <DialogTrigger
            asChild
          >
            <Button
              size="sm"
              className="gap-1.5 rounded-xl"
            >
              <Plus className="size-4" />

              <span className="hidden sm:inline">
                New request
              </span>
            </Button>
          </DialogTrigger>

          <DialogContent className="rounded-3xl sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Create a learning request
              </DialogTitle>

              <DialogDescription>
                Your request is broadcast to every student.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">
                    Subject
                  </Label>

                  <select
                    value={
                      form.subject
                    }
                    onChange={(
                      e
                    ) =>
                      setForm({
                        ...form,
                        subject:
                          e.target
                            .value,
                      })
                    }
                    className="mt-1 h-9 w-full rounded-xl border border-input bg-card/70 px-3 text-sm"
                  >
                    {subjects.map(
                      (
                        subject
                      ) => (
                        <option
                          key={
                            subject
                          }
                        >
                          {
                            subject
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <Label className="text-xs">
                    Mode
                  </Label>

                  <select
                    value={
                      form.mode
                    }
                    onChange={(
                      e
                    ) =>
                      setForm({
                        ...form,
                        mode:
                          e.target
                            .value,
                      })
                    }
                    className="mt-1 h-9 w-full rounded-xl border border-input bg-card/70 px-3 text-sm"
                  >
                    <option>
                      Online
                    </option>

                    <option>
                      Offline
                    </option>

                    <option>
                      Either
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-xs">
                  Skill level
                </Label>

                <select
                  value={
                    form.skillLevel
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      skillLevel:
                        e.target
                          .value,
                    })
                  }
                  className="mt-1 h-9 w-full rounded-xl border border-input bg-card/70 px-3 text-sm"
                >
                  <option>
                    Beginner
                  </option>

                  <option>
                    Intermediate
                  </option>

                  <option>
                    Advanced
                  </option>
                </select>
              </div>

              <div>
                <Label className="text-xs">
                  Topic
                </Label>

                <Input
                  value={
                    form.topic
                  }
                  onChange={(
                    e
                  ) =>
                    setForm({
                      ...form,
                      topic:
                        e.target
                          .value,
                    })
                  }
                  placeholder="e.g. Dynamic programming on trees"
                  className="mt-1 rounded-xl"
                />
              </div>

              <div>
                <Label className="text-xs">
                  Preferred time
                </Label>

                <Input
                  value={
                    form.preferredTime
                  }
                  onChange={(
                    e
                  ) =>
                    setForm({
                      ...form,
                      preferredTime:
                        e.target
                          .value,
                    })
                  }
                  placeholder="e.g. Today, 18:00"
                  className="mt-1 rounded-xl"
                />
              </div>

              <div>
                <Label className="text-xs">
                  Description
                </Label>

                <Textarea
                  rows={3}
                  value={
                    form.description
                  }
                  onChange={(
                    e
                  ) =>
                    setForm({
                      ...form,
                      description:
                        e.target
                          .value,
                    })
                  }
                  className="mt-1 rounded-xl"
                  placeholder="What exactly do you need help with?"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                className="rounded-xl"
                onClick={
                  broadcast
                }
                disabled={
                  !form.topic.trim()
                }
              >
                Broadcast request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="space-y-5">

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              label:
                "Open broadcasts",
              value:
                incoming.length,
              icon: Radio,
            },

            {
              label:
                "Sessions matched",
              value:
                matches.length,
              icon: Check,
            },

            {
              label:
                "My requests",
              value:
                mine.length,
              icon:
                MessageSquare,
            },
          ].map(
            (stat) => (
              <GlassCard
                key={
                  stat.label
                }
              >
                <stat.icon className="size-5 text-primary" />

                <p className="mt-3 font-display text-2xl font-extrabold">
                  {
                    stat.value
                  }
                </p>

                <p className="text-xs text-muted-foreground">
                  {
                    stat.label
                  }
                </p>
              </GlassCard>
            )
          )}
        </div>

        <GlassCard className="flex flex-wrap items-center gap-2">
          {tabs.map(
            (item) => (
              <button
                key={item}
                onClick={() =>
                  setTab(
                    item
                  )
                }
                className={cn(
                  "rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors",

                  tab === item
                    ? "bg-gradient-brand text-primary-foreground shadow-md shadow-primary/25"
                    : "bg-card/70 text-muted-foreground hover:bg-accent/60"
                )}
              >
                {item}
              </button>
            )
          )}

          <span className="mx-1 hidden h-5 w-px bg-border sm:block" />

          <select
            value={mode}
            onChange={(e) =>
              setMode(
                e.target.value
              )
            }
            className="h-8 rounded-xl border border-input bg-card/70 px-2 text-xs"
          >
            <option value="All">
              Any mode
            </option>

            <option>
              Online
            </option>

            <option>
              Offline
            </option>

            <option>
              Either
            </option>
          </select>

          <select
            value={subject}
            onChange={(e) =>
              setSubject(
                e.target.value
              )
            }
            className="h-8 rounded-xl border border-input bg-card/70 px-2 text-xs"
          >
            <option>
              All subjects
            </option>

            {subjects.map(
              (subject) => (
                <option
                  key={
                    subject
                  }
                >
                  {subject}
                </option>
              )
            )}
          </select>
        </GlassCard>

        {loading && (
          <GlassCard className="text-center text-sm text-muted-foreground">
            Loading peer learning requests...
          </GlassCard>
        )}

        {!loading && (
          <div className="grid gap-4 lg:grid-cols-2">
            {list.map(
              (request) => {
                const isMine =
                  String(
                    request.studentId
                  ) ===
                  String(
                    currentUserId
                  );

                return (
                  <GlassCard
                    key={
                      request.id
                    }
                    className="flex h-full flex-col"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gradient-brand text-xs font-bold text-primary-foreground">
                        {
                          request.initials
                        }
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {
                            request.student
                          }
                        </p>

                        <p className="truncate text-xs text-muted-foreground">
                          {
                            request.subject
                          }{" "}
                          ·{" "}
                          {
                            request.posted
                          }
                        </p>
                      </div>

                      <Badge
                        variant="secondary"
                        className="shrink-0 gap-1 rounded-lg"
                      >
                        {request.mode ===
                        "Online" ? (
                          <Video className="size-3" />
                        ) : (
                          <MapPin className="size-3" />
                        )}

                        {
                          request.mode
                        }
                      </Badge>
                    </div>

                    <p className="mt-3 font-semibold">
                      {
                        request.topic
                      }
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {
                        request.description
                      }
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className="rounded-lg"
                      >
                        {
                          request.skillLevel
                        }
                      </Badge>

                      <Badge
                        variant="outline"
                        className="rounded-lg"
                      >
                        {
                          request.status
                        }
                      </Badge>
                    </div>

                    <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="size-3.5" />

                      {
                        request.preferredTime
                      }
                    </p>

                    <div className="mt-4 flex gap-2">
                      {isMine &&
                        request.status ===
                          "Open" && (
                          <>
                            <Badge
                              variant="outline"
                              className="rounded-lg"
                            >
                              Broadcasting…
                            </Badge>

                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 rounded-xl"
                              onClick={() =>
                                cancelRequest(
                                  request
                                )
                              }
                            >
                              <X className="size-3.5" />

                              Cancel
                            </Button>
                          </>
                        )}

                      {request.status ===
                        "Accepted" && (
                        <Button
                          size="sm"
                          className="gap-1.5 rounded-xl"
                          disabled={
                            openingChatId ===
                            request.id
                          }
                          onClick={() =>
                            openPeerChat(
                              request
                            )
                          }
                        >
                          <MessageSquare className="size-3.5" />

                          {openingChatId ===
                          request.id
                            ? "Opening..."
                            : "Open chat"}
                        </Button>
                      )}

                      {!isMine &&
                        request.status ===
                          "Open" && (
                          <>
                            <Button
                              size="sm"
                              className="gap-1.5 rounded-xl"
                              onClick={() =>
                                onAccept(
                                  request
                                )
                              }
                            >
                              <Check className="size-3.5" />

                              Accept
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 rounded-xl bg-card/60"
                              onClick={() =>
                                declineIncoming(
                                  request
                                )
                              }
                            >
                              <X className="size-3.5" />

                              Decline
                            </Button>
                          </>
                        )}

                      {request.status ===
                        "Cancelled" && (
                        <Badge
                          variant="outline"
                          className="rounded-lg text-muted-foreground"
                        >
                          Cancelled
                        </Badge>
                      )}
                    </div>
                  </GlassCard>
                );
              }
            )}

            {list.length ===
              0 && (
              <GlassCard className="text-sm text-muted-foreground lg:col-span-2">
                Nothing here yet.
              </GlassCard>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}

/* =====================================================
   HELPERS
===================================================== */

function getInitials(name) {
  if (!name) {
    return "ST";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (part) =>
        part[0]
    )
    .join("")
    .toUpperCase();
}

function formatPostedTime(
  createdAt
) {
  if (!createdAt) {
    return "Recently";
  }

  const created =
    new Date(
      createdAt
    );

  const now =
    new Date();

  const difference =
    now - created;

  const minutes =
    Math.floor(
      difference /
        60000
    );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days =
    Math.floor(
      hours / 24
    );

  return `${days}d ago`;
}