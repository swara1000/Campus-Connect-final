import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Send,
  Circle,
  Paperclip,
  Smile,
  Search,
} from "lucide-react";

import { io } from "socket.io-client";

import {
  AppShell,
  GlassCard,
} from "@/components/AppShell";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCampus } from "@/lib/campus-store";
import { cn } from "@/lib/utils";

const API_URL = "http://localhost:5000/api/chat";
const SOCKET_URL = "http://localhost:5000";

/* =====================================================
   CREATE SOCKET CONNECTION
===================================================== */

const socket = io(SOCKET_URL, {
  autoConnect: false,
});

export const Route = createFileRoute("/chat")({
  validateSearch: (search) => ({
    conversationId:
      typeof search.conversationId === "string"
        ? search.conversationId
        : "",
  }),

  head: () => ({
    meta: [
      {
        title: "Campus Chat — CampusConnect",
      },
      {
        name: "description",
        content:
          "Real-time private messaging between matched peer learning students.",
      },
    ],
  }),

  component: ChatPage,
});

function ChatPage() {
  const { user } = useCampus();

  const navigate = useNavigate();

  const { conversationId } = Route.useSearch();

  const [conversations, setConversations] = useState([]);

  const [activeId, setActiveId] = useState(
    conversationId || ""
  );

  const [messages, setMessages] = useState([]);

  const [draft, setDraft] = useState("");

  const [loadingConversations, setLoadingConversations] =
    useState(true);

  const [loadingMessages, setLoadingMessages] =
    useState(false);

  const [sending, setSending] = useState(false);

  const [search, setSearch] = useState("");

  const [connected, setConnected] = useState(false);

  const [typingUser, setTypingUser] = useState("");

  const endRef = useRef(null);

  const typingTimeoutRef = useRef(null);

  /* =====================================================
     TOKEN
  ===================================================== */

  const getToken = () =>
    localStorage.getItem("campusconnect_token");

  /* =====================================================
     CURRENT USER
  ===================================================== */

  const getCurrentUserId = () => {
    if (user?._id) {
      return String(user._id);
    }

    if (user?.id) {
      return String(user.id);
    }

    try {
      const storedUser = JSON.parse(
        localStorage.getItem("campusconnect_user") || "{}"
      );

      return String(
        storedUser?._id ||
          storedUser?.id ||
          ""
      );
    } catch {
      return "";
    }
  };

  const currentUserId = getCurrentUserId();

  /* =====================================================
     SOCKET CONNECTION
  ===================================================== */

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      console.log(
        "Socket connected:",
        socket.id
      );

      setConnected(true);
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected");

      setConnected(false);
    };

    socket.on(
      "connect",
      handleConnect
    );

    socket.on(
      "disconnect",
      handleDisconnect
    );

    if (socket.connected) {
      setConnected(true);
    }

    return () => {
      socket.off(
        "connect",
        handleConnect
      );

      socket.off(
        "disconnect",
        handleDisconnect
      );
    };
  }, []);

  /* =====================================================
     JOIN CONVERSATION ROOM
  ===================================================== */

  useEffect(() => {
    if (!activeId) {
      return;
    }

    console.log(
      "Joining conversation:",
      activeId
    );

    socket.emit(
      "join-conversation",
      activeId
    );

    return () => {
      socket.emit(
        "leave-conversation",
        activeId
      );
    };
  }, [activeId]);

  /* =====================================================
     RECEIVE REAL-TIME MESSAGE
  ===================================================== */

  useEffect(() => {
    const handleNewMessage = (
      message
    ) => {
      console.log(
        "Real-time message received:",
        message
      );

      const messageConversationId =
        String(
          message.conversation?._id ||
            message.conversation ||
            ""
        );

      /*
       * Update conversation preview even when
       * another conversation is currently open.
       */
      setConversations(
        (previous) =>
          previous.map(
            (conversation) =>
              String(
                conversation.id
              ) ===
              messageConversationId
                ? {
                    ...conversation,
                    last:
                      message.text,
                  }
                : conversation
          )
      );

      /*
       * Only put the message inside the current
       * chat window when it belongs to this room.
       */
      if (
        messageConversationId !==
        String(activeId)
      ) {
        return;
      }

      const senderId =
        message.sender?._id ||
        message.sender;

      const formattedMessage = {
        id: message._id,

        from:
          message.sender?.name ||
          "Student",

        senderId,

        initials:
          getInitials(
            message.sender?.name
          ),

        body:
          message.text,

        time:
          formatTime(
            message.createdAt
          ),

        me:
          String(senderId) ===
          String(currentUserId),
      };

      setMessages(
        (previous) => {
          /*
           * Prevent duplicate messages because
           * sender receives HTTP response and
           * Socket.IO event.
           */
          const alreadyExists =
            previous.some(
              (item) =>
                String(item.id) ===
                String(
                  formattedMessage.id
                )
            );

          if (alreadyExists) {
            return previous;
          }

          return [
            ...previous,
            formattedMessage,
          ];
        }
      );
    };

    socket.on(
      "new-message",
      handleNewMessage
    );

    return () => {
      socket.off(
        "new-message",
        handleNewMessage
      );
    };
  }, [
    activeId,
    currentUserId,
  ]);

  /* =====================================================
     TYPING EVENTS
  ===================================================== */

  useEffect(() => {
    const handleTyping = ({
      conversationId,
      userName,
    }) => {
      if (
        String(
          conversationId
        ) !==
        String(activeId)
      ) {
        return;
      }

      setTypingUser(
        userName ||
          "Student"
      );
    };

    const handleStopTyping = ({
      conversationId,
    }) => {
      if (
        String(
          conversationId
        ) !==
        String(activeId)
      ) {
        return;
      }

      setTypingUser("");
    };

    socket.on(
      "user-typing",
      handleTyping
    );

    socket.on(
      "user-stop-typing",
      handleStopTyping
    );

    return () => {
      socket.off(
        "user-typing",
        handleTyping
      );

      socket.off(
        "user-stop-typing",
        handleStopTyping
      );
    };
  }, [activeId]);

  /* =====================================================
     FETCH CONVERSATIONS
  ===================================================== */

  const fetchConversations =
    async () => {
      try {
        setLoadingConversations(
          true
        );

        const token =
          getToken();

        if (!token) {
          return;
        }

        const response =
          await fetch(
            `${API_URL}/conversations`,
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
          console.error(
            data.message ||
              "Failed to fetch conversations"
          );

          return;
        }

        const formatted =
          (
            data.conversations ||
            []
          ).map(
            (conversation) => {
              const otherUser =
                conversation.participants?.find(
                  (participant) =>
                    String(
                      participant._id
                    ) !==
                    String(
                      currentUserId
                    )
                );

              return {
                id:
                  conversation._id,

                name:
                  otherUser?.name ||
                  "Peer Student",

                email:
                  otherUser?.email ||
                  "",

                department:
                  otherUser?.department ||
                  "",

                year:
                  otherUser?.year ||
                  "",

                initials:
                  getInitials(
                    otherUser?.name
                  ),

                last:
                  conversation.lastMessage ||
                  "Start a conversation",

                updatedAt:
                  conversation.updatedAt,

                participants:
                  conversation.participants ||
                  [],
              };
            }
          );

        setConversations(
          formatted
        );

        if (
          conversationId &&
          formatted.some(
            (item) =>
              String(item.id) ===
              String(
                conversationId
              )
          )
        ) {
          setActiveId(
            conversationId
          );
        } else if (
          !activeId &&
          formatted.length >
            0
        ) {
          setActiveId(
            formatted[0].id
          );
        }
      } catch (error) {
        console.error(
          "Fetch conversations error:",
          error
        );
      } finally {
        setLoadingConversations(
          false
        );
      }
    };

  /* =====================================================
     FETCH MESSAGES
  ===================================================== */

  const fetchMessages =
    async (id) => {
      if (!id) {
        setMessages([]);
        return;
      }

      try {
        setLoadingMessages(
          true
        );

        const token =
          getToken();

        if (!token) {
          return;
        }

        const response =
          await fetch(
            `${API_URL}/conversations/${id}/messages`,
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
          console.error(
            data.message ||
              "Failed to fetch messages"
          );

          return;
        }

        const formatted =
          (
            data.messages ||
            []
          ).map(
            (message) => {
              const senderId =
                message.sender?._id ||
                message.sender;

              return {
                id:
                  message._id,

                from:
                  message.sender?.name ||
                  "Student",

                senderId,

                initials:
                  getInitials(
                    message.sender?.name
                  ),

                body:
                  message.text,

                time:
                  formatTime(
                    message.createdAt
                  ),

                me:
                  String(
                    senderId
                  ) ===
                  String(
                    currentUserId
                  ),
              };
            }
          );

        setMessages(
          formatted
        );
      } catch (error) {
        console.error(
          "Fetch messages error:",
          error
        );
      } finally {
        setLoadingMessages(
          false
        );
      }
    };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    fetchConversations();
  }, []);

  /* =====================================================
     ACTIVE CONVERSATION CHANGE
  ===================================================== */

  useEffect(() => {
    if (!activeId) {
      return;
    }

    fetchMessages(
      activeId
    );

    navigate({
      to: "/chat",

      search: {
        conversationId:
          activeId,
      },

      replace: true,
    });
  }, [activeId]);

  /* =====================================================
     AUTO SCROLL
  ===================================================== */

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [
    messages.length,
    typingUser,
  ]);

  /* =====================================================
     HANDLE TYPING
  ===================================================== */

  const handleDraftChange =
    (event) => {
      const value =
        event.target.value;

      setDraft(value);

      if (!activeId) {
        return;
      }

      socket.emit(
        "typing",
        {
          conversationId:
            activeId,

          userName:
            user?.name ||
            "Student",
        }
      );

      if (
        typingTimeoutRef.current
      ) {
        clearTimeout(
          typingTimeoutRef.current
        );
      }

      typingTimeoutRef.current =
        setTimeout(
          () => {
            socket.emit(
              "stop-typing",
              {
                conversationId:
                  activeId,
              }
            );
          },
          1000
        );
    };

  /* =====================================================
     SEND MESSAGE
  ===================================================== */

  const send =
    async () => {
      const body =
        draft
          .trim()
          .slice(
            0,
            500
          );

      if (
        !body ||
        !activeId ||
        sending
      ) {
        return;
      }

      try {
        setSending(true);

        setDraft("");

        socket.emit(
          "stop-typing",
          {
            conversationId:
              activeId,
          }
        );

        const token =
          getToken();

        if (!token) {
          return;
        }

        const response =
          await fetch(
            `${API_URL}/conversations/${activeId}/messages`,
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
                  text: body,
                }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          console.error(
            data.message ||
              "Failed to send message"
          );

          /*
           * Restore message if sending failed.
           */
          setDraft(body);

          return;
        }

        /*
         * The backend emits new-message through
         * Socket.IO, but we also add the HTTP result.
         *
         * Duplicate prevention in the Socket listener
         * makes this safe.
         */

        const message =
          data.message;

        const formattedMessage = {
          id:
            message._id,

          from:
            message.sender?.name ||
            user?.name ||
            "You",

          senderId:
            message.sender?._id ||
            currentUserId,

          initials:
            getInitials(
              message.sender?.name ||
                user?.name
            ),

          body:
            message.text,

          time:
            formatTime(
              message.createdAt
            ),

          me: true,
        };

        setMessages(
          (previous) => {
            const exists =
              previous.some(
                (item) =>
                  String(
                    item.id
                  ) ===
                  String(
                    formattedMessage.id
                  )
              );

            if (exists) {
              return previous;
            }

            return [
              ...previous,
              formattedMessage,
            ];
          }
        );

        setConversations(
          (previous) =>
            previous.map(
              (conversation) =>
                String(
                  conversation.id
                ) ===
                String(
                  activeId
                )
                  ? {
                      ...conversation,
                      last:
                        body,
                    }
                  : conversation
            )
        );
      } catch (error) {
        console.error(
          "Send message error:",
          error
        );

        setDraft(body);
      } finally {
        setSending(false);
      }
    };

  /* =====================================================
     ACTIVE CONVERSATION
  ===================================================== */

  const active =
    conversations.find(
      (conversation) =>
        String(
          conversation.id
        ) ===
        String(activeId)
    );

  /* =====================================================
     SEARCH
  ===================================================== */

  const filteredConversations =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return conversations;
      }

      return conversations.filter(
        (conversation) =>
          [
            conversation.name,
            conversation.email,
            conversation.department,
          ]
            .join(" ")
            .toLowerCase()
            .includes(
              query
            )
      );
    }, [
      conversations,
      search,
    ]);

  /* =====================================================
     UI
  ===================================================== */

  return (
    <AppShell
      title="Chat"
      subtitle="Real-time private peer learning conversations"
      action={
        <Badge
          variant="secondary"
          className="hidden gap-1.5 rounded-lg sm:flex"
        >
          <Circle
            className={cn(
              "size-2",
              connected &&
                "fill-[var(--success)] text-[var(--success)]"
            )}
          />

          {connected
            ? "Connected"
            : "Connecting..."}
        </Badge>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">

        {/* CONVERSATION LIST */}

        <GlassCard className="hidden p-3 lg:block">

          <div className="relative mb-3">

            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search conversations"
              className="rounded-xl bg-card/70 pl-9"
            />

          </div>

          {loadingConversations ? (

            <p className="p-3 text-sm text-muted-foreground">
              Loading conversations...
            </p>

          ) : (

            <div className="space-y-1">

              {filteredConversations.map(
                (conversation) => (

                  <button
                    key={
                      conversation.id
                    }
                    onClick={() =>
                      setActiveId(
                        conversation.id
                      )
                    }
                    className={cn(
                      "grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-2xl p-2.5 text-left transition-colors",

                      activeId ===
                        conversation.id
                        ? "bg-gradient-brand text-primary-foreground"
                        : "hover:bg-accent/60"
                    )}
                  >

                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-card/40 text-xs font-bold">
                      {
                        conversation.initials
                      }
                    </span>

                    <span className="min-w-0">

                      <span className="block truncate text-sm font-semibold">
                        {
                          conversation.name
                        }
                      </span>

                      <span
                        className={cn(
                          "block truncate text-xs",

                          activeId ===
                            conversation.id
                            ? "text-primary-foreground/75"
                            : "text-muted-foreground"
                        )}
                      >
                        {
                          conversation.last
                        }
                      </span>

                    </span>

                  </button>

                )
              )}

              {filteredConversations.length ===
                0 && (

                <p className="p-3 text-sm text-muted-foreground">
                  No conversations yet.
                </p>

              )}

            </div>

          )}

        </GlassCard>

        {/* CHAT WINDOW */}

        <GlassCard className="flex h-[70vh] flex-col p-0">

          {active ? (

            <>

              {/* HEADER */}

              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border/60 px-5 py-3.5">

                <div className="flex min-w-0 items-center gap-3">

                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary text-xs font-bold">
                    {
                      active.initials
                    }
                  </span>

                  <div className="min-w-0">

                    <p className="truncate text-sm font-bold">
                      {
                        active.name
                      }
                    </p>

                    <p className="truncate text-xs text-muted-foreground">

                      {typingUser
                        ? `${typingUser} is typing...`
                        : [
                            active.department,
                            active.year,
                          ]
                            .filter(Boolean)
                            .join(" · ") ||
                          active.email ||
                          "Peer learning match"}

                    </p>

                  </div>

                </div>

              </div>

              {/* MESSAGES */}

              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">

                {loadingMessages ? (

                  <p className="text-center text-sm text-muted-foreground">
                    Loading messages...
                  </p>

                ) : (

                  <>

                    {messages.map(
                      (message) => (

                        <div
                          key={
                            message.id
                          }
                          className={cn(
                            "flex gap-3",
                            message.me &&
                              "flex-row-reverse"
                          )}
                        >

                          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-brand text-[10px] font-bold text-primary-foreground">
                            {
                              message.initials
                            }
                          </span>

                          <div
                            className={cn(
                              "max-w-[75%] min-w-0",
                              message.me &&
                                "text-right"
                            )}
                          >

                            <p className="mb-1 text-[11px] text-muted-foreground">
                              {
                                message.from
                              }{" "}
                              ·{" "}
                              {
                                message.time
                              }
                            </p>

                            <p
                              className={cn(
                                "inline-block rounded-2xl px-4 py-2.5 text-left text-sm",

                                message.me
                                  ? "bg-gradient-brand text-primary-foreground"
                                  : "border border-border/60 bg-card/80"
                              )}
                            >
                              {
                                message.body
                              }
                            </p>

                          </div>

                        </div>

                      )
                    )}

                    {messages.length ===
                      0 && (

                      <p className="text-center text-sm text-muted-foreground">
                        No messages yet. Start the conversation.
                      </p>

                    )}

                  </>

                )}

                <div ref={endRef} />

              </div>

              {/* INPUT */}

              <div className="border-t border-border/60 p-3">

                <div className="flex items-center gap-2">

                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground"
                    disabled
                  >
                    <Paperclip className="size-4" />
                  </Button>

                  <Input
                    value={draft}
                    maxLength={500}
                    onChange={
                      handleDraftChange
                    }
                    onKeyDown={(e) => {

                      if (
                        e.key ===
                          "Enter" &&
                        !e.shiftKey
                      ) {
                        e.preventDefault();
                        send();
                      }

                    }}
                    placeholder={`Message ${active.name}`}
                    className="rounded-xl bg-card/70"
                  />

                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden shrink-0 text-muted-foreground sm:inline-flex"
                    disabled
                  >
                    <Smile className="size-4" />
                  </Button>

                  <Button
                    size="icon"
                    className="shrink-0 rounded-xl"
                    onClick={send}
                    disabled={
                      !draft.trim() ||
                      sending
                    }
                  >
                    <Send className="size-4" />
                  </Button>

                </div>

              </div>

            </>

          ) : (

            <div className="grid flex-1 place-items-center p-6">

              <div className="text-center">

                <MessageEmptyIcon />

                <p className="mt-3 font-semibold">
                  No conversation selected
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Accept a Peer Learning request and open its chat.
                </p>

              </div>

            </div>

          )}

        </GlassCard>

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

function formatTime(date) {
  if (!date) {
    return "";
  }

  return new Date(
    date
  ).toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function MessageEmptyIcon() {
  return (
    <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-secondary">
      <Send className="size-5 text-muted-foreground" />
    </div>
  );
}