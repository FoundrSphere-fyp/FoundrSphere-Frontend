"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import Link from "next/link"
import { useSocket } from "@/components/SocketProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Send,
  Loader2,
  Video,
  Wifi,
  WifiOff,
  Search,
  Clock,
  MessageCircle,
  Users,
  PanelLeft,
} from "lucide-react"
import toast from "react-hot-toast"
import { useUserStore } from "@/store/store"
import { cn } from "@/lib/utils"

const MEET_BASE = "https://meetup.foundrsphere.com/join/"

function generateRoomId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
}

function buildMeetingUrl() {
  const room = generateRoomId()
  return `${MEET_BASE}?room=${encodeURIComponent(room)}`
}

function getOtherParticipant(participants, userId) {
  return participants?.find((p) => String(p._id) !== String(userId))
}

function formatTimestamp(timestamp) {
  if (!timestamp) return ""
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = (now - date) / (1000 * 60 * 60)

  if (diffInHours < 24) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }
  if (diffInHours < 48) return "Yesterday"
  if (diffInHours < 168) {
    return date.toLocaleDateString("en-US", { weekday: "short" })
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

const URL_SPLIT = /(https?:\/\/[^\s]+)/g

function MessageBody({ text, isMine }) {
  if (!text) return null
  const parts = text.split(URL_SPLIT)
  return (
    <>
      {parts.map((part, i) => {
        if (/^https?:\/\//.test(part)) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "break-all underline underline-offset-2 transition-colors",
                isMine
                  ? "text-white/95 hover:text-white"
                  : "text-primary hover:text-primary/90"
              )}
            >
              {part}
            </a>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

function ConversationListItems({
  items,
  userId,
  conversationId,
  onNavigate,
}) {
  return (
    <div className="flex flex-col gap-0.5 p-2">
      {items.map((conv) => {
        const other = getOtherParticipant(conv.participants, userId)
        const active = String(conv._id) === String(conversationId)
        const initial = (other?.fullName || other?.username || "?")
          .charAt(0)
          .toUpperCase()

        return (
          <Link
            key={String(conv._id)}
            href={`/chat/${conv._id}`}
            onClick={onNavigate}
            className={cn(
              "flex gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
              active
                ? "bg-primary/12 ring-1 ring-primary/25"
                : "hover:bg-muted/80"
            )}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate font-semibold">
                  {other?.fullName || "Unknown"}
                </span>
                <span className="flex shrink-0 items-center gap-0.5 text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatTimestamp(conv.lastMessageAt)}
                </span>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                @{other?.username || "unknown"}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground/90">
                {conv.lastMessage || "No messages yet"}
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

export default function ChatPage() {
  const { id: conversationId } = useParams()
  const router = useRouter()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [otherUser, setOtherUser] = useState(null)
  const [messagesLoading, setMessagesLoading] = useState(true)
  const [conversations, setConversations] = useState([])
  const [conversationsLoading, setConversationsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sendingMeet, setSendingMeet] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const { socket, isConnected } = useSocket()
  const messagesEndRef = useRef(null)

  const { userId } = useUserStore()

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations
    const q = searchQuery.toLowerCase()
    return conversations.filter((conv) => {
      const other = getOtherParticipant(conv.participants, userId)
      return (
        other?.fullName?.toLowerCase().includes(q) ||
        other?.username?.toLowerCase().includes(q) ||
        conv.lastMessage?.toLowerCase().includes(q)
      )
    })
  }, [searchQuery, conversations, userId])

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const fetchConversations = useCallback(async () => {
    try {
      setConversationsLoading(true)
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/messages/get-conversations`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      const data = await res.json()
      if (data.type === "success") {
        setConversations(data.conversations || [])
      } else {
        toast.error(data.message || "Failed to load conversations")
      }
    } catch {
      toast.error("Failed to load conversations")
    } finally {
      setConversationsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  useEffect(() => {
    if (!conversationId || !userId || conversationsLoading) return
    const conv = conversations.find(
      (c) => String(c._id) === String(conversationId)
    )
    if (conv) {
      const other = getOtherParticipant(conv.participants, userId)
      setOtherUser(other || null)
    } else {
      setOtherUser(null)
      if (conversations.length > 0) {
        toast.error("Conversation not found")
      }
    }
  }, [conversationId, conversations, userId, conversationsLoading])

  useEffect(() => {
    if (!conversationId) return
    let cancelled = false

    const load = async () => {
      setMessagesLoading(true)
      setMessages([])
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/messages/get-messages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ conversationId }),
          }
        )
        const data = await res.json()
        if (cancelled) return
        if (data.type === "success") {
          setMessages(data.messages || [])
        } else {
          toast.error(data.message || "Failed to load messages")
        }
      } catch {
        if (!cancelled) toast.error("Failed to load messages")
      } finally {
        if (!cancelled) setMessagesLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [conversationId, userId])

  useEffect(() => {
    if (!socket) return

    const handleReceiveMessage = (message) => {
      if (message.senderId !== userId) {
        setMessages((prev) => [...prev, message])
      }
    }

    const handleMessageSent = (message) => {
      setMessages((prev) => {
        const hasTemp = prev.some(
          (msg) => msg.tempId && msg.content === message.content
        )
        if (hasTemp) {
          return prev.map((msg) =>
            msg.tempId && msg.content === message.content
              ? { ...message, senderId: message.senderId, sender: message.sender }
              : msg
          )
        }
        return prev
      })
    }

    socket.on("receive_message", handleReceiveMessage)
    socket.on("message_sent", handleMessageSent)

    return () => {
      socket.off("receive_message", handleReceiveMessage)
      socket.off("message_sent", handleMessageSent)
    }
  }, [socket, userId])

  const emitMessage = useCallback(
    (content) => {
      if (!content.trim() || !socket || !otherUser) return

      const tempId = `temp-${Date.now()}`
      const messageData = {
        senderId: userId,
        receiverId: otherUser._id,
        content: content.trim(),
      }

      const optimisticMessage = {
        _id: tempId,
        tempId,
        senderId: userId,
        receiverId: otherUser._id,
        content: content.trim(),
        createdAt: new Date(),
      }
      setMessages((prev) => [...prev, optimisticMessage])
      socket.emit("send_message", messageData)
    },
    [socket, otherUser, userId]
  )

  const sendMessage = () => {
    if (!newMessage.trim() || !isConnected) return
    emitMessage(newMessage)
    setNewMessage("")
  }

  const sendVideoMeetingLink = () => {
    if (!isConnected || !socket || !otherUser) {
      toast.error("Wait until you’re connected to send a meeting link.")
      return
    }
    setSendingMeet(true)
    try {
      const url = buildMeetingUrl()
      const text = `Video call — join here:\n${url}`
      emitMessage(text)
      toast.success("Meeting link sent")
    } finally {
      setSendingMeet(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const sidebarSearchBlock = (
    <div className="border-b border-border/60 bg-background/50 p-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search chats…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9 rounded-lg pl-9 text-sm"
        />
      </div>
    </div>
  )

  const sidebarListBlock = (
    <>
      {conversationsLoading ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Loading chats…</p>
        </div>
      ) : filteredConversations.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
          <MessageCircle className="h-10 w-10 text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground">
            {searchQuery ? "No chats match your search." : "No conversations yet."}
          </p>
          {!searchQuery && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              asChild
            >
              <Link href="/founders">
                <Users className="mr-2 h-4 w-4" />
                Browse people
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ConversationListItems
            items={filteredConversations}
            userId={userId}
            conversationId={conversationId}
            onNavigate={() => setSheetOpen(false)}
          />
        </div>
      )}
      <div className="border-t border-border/60 p-3">
        <Button variant="outline" className="w-full gap-2" size="sm" asChild>
          <Link href="/founders">
            <Users className="h-4 w-4" />
            New chat
          </Link>
        </Button>
      </div>
    </>
  )

  const displayName = otherUser?.fullName || "Conversation"
  const initial = (otherUser?.fullName || otherUser?.username || "?")
    .charAt(0)
    .toUpperCase()

  return (
    <div className="flex min-h-[100dvh] bg-gradient-to-b from-background to-muted/30">
      {/* Desktop sidebar */}
      <aside className="hidden w-[min(100%,320px)] shrink-0 flex-col border-r border-border/80 bg-muted/15 lg:flex">
        <div className="border-b border-border/60 px-4 py-3">
          <h2 className="text-lg font-semibold tracking-tight">Messages</h2>
          <p className="text-xs text-muted-foreground">
            {conversations.length} chat{conversations.length !== 1 ? "s" : ""}
          </p>
        </div>
        {sidebarSearchBlock}
        <div className="flex min-h-0 flex-1 flex-col">{sidebarListBlock}</div>
      </aside>

      {/* Main thread */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-border/80 bg-background/80 px-3 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 lg:hidden"
              onClick={() => setSheetOpen(true)}
              aria-label="Open chat list"
            >
              <PanelLeft className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => router.push("/chat")}
              aria-label="Back to inbox"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <Avatar className="h-10 w-10 border border-border/60 shadow-sm sm:h-11 sm:w-11">
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-sm font-semibold text-primary sm:text-base">
                {initial}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-semibold tracking-tight sm:text-lg">
                {displayName}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {otherUser?.username && (
                  <span className="truncate">@{otherUser.username}</span>
                )}
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
                    isConnected
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : "bg-destructive/10 text-destructive"
                  )}
                >
                  {isConnected ? (
                    <>
                      <Wifi className="h-3 w-3" />
                      Live
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-3 w-3" />
                      Offline
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-4 sm:px-4 sm:py-6">
          {messagesLoading ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Loading messages…
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
              <div className="rounded-full bg-muted/80 p-4">
                <Send className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="max-w-xs text-sm text-muted-foreground">
                No messages yet. Say hello or start a video call with a meeting
                link.
              </p>
            </div>
          ) : (
            <div className="mx-auto flex w-full max-w-xl flex-col gap-1">
              {messages.map((msg, idx) => {
                const isMyMessage =
                  msg.senderId === userId || msg.sender?._id === userId
                const prev = messages[idx - 1]
                const showAvatar =
                  !isMyMessage &&
                  (!prev ||
                    prev.senderId === userId ||
                    prev.sender?._id === userId)

                const t = msg.createdAt ? new Date(msg.createdAt) : null
                const timeStr = t
                  ? t.toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit",
                    })
                  : ""

                return (
                  <div
                    key={msg._id || msg.tempId}
                    className={cn(
                      "flex w-full gap-2",
                      isMyMessage ? "justify-end" : "justify-start",
                      idx > 0 ? "mt-1" : ""
                    )}
                  >
                    {!isMyMessage && (
                      <div className="w-8 shrink-0 pt-1">
                        {showAvatar ? (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-[10px] font-medium">
                              {initial}
                            </AvatarFallback>
                          </Avatar>
                        ) : null}
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ring-1 ring-black/5 dark:ring-white/10",
                        isMyMessage
                          ? "rounded-br-md bg-primary text-primary-foreground"
                          : "rounded-bl-md bg-card text-card-foreground"
                      )}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">
                        <MessageBody text={msg.content} isMine={isMyMessage} />
                      </p>
                      <p
                        className={cn(
                          "mt-1.5 flex items-center justify-end gap-1.5 text-[10px] tabular-nums",
                          isMyMessage
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        )}
                      >
                        {timeStr}
                        {msg.tempId && (
                          <span className="italic opacity-80">Sending…</span>
                        )}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} className="h-1 shrink-0" />
            </div>
          )}
        </div>

        <footer className="border-t border-border/80 bg-background/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:p-4">
          <div className="mx-auto flex max-w-xl flex-col gap-3">
            <div className="flex items-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11 shrink-0 rounded-xl"
                disabled={!isConnected || sendingMeet || !otherUser}
                onClick={sendVideoMeetingLink}
                title="Send video meeting link"
                aria-label="Send video meeting link"
              >
                {sendingMeet ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Video className="h-4 w-4" />
                )}
              </Button>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isConnected ? "Message…" : "Connecting to chat…"
                }
                disabled={!isConnected}
                className="min-h-11 flex-1 rounded-xl border-border/80 bg-muted/30 px-4 shadow-inner focus-visible:ring-primary/30"
              />
              <Button
                type="button"
                size="icon"
                className="h-11 w-11 shrink-0 rounded-xl"
                onClick={sendMessage}
                disabled={!isConnected || !newMessage.trim()}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-center text-[11px] text-muted-foreground">
              Video link uses{" "}
              <span className="font-mono text-[10px]">
                meetup.foundrsphere.com
              </span>{" "}
              with a unique room id each time.
            </p>
          </div>
        </footer>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="flex w-full flex-col p-0 sm:max-w-sm">
          <SheetHeader className="border-b border-border/60 px-4 py-3 text-left">
            <SheetTitle className="text-lg">Messages</SheetTitle>
            <p className="text-xs font-normal text-muted-foreground">
              {conversations.length} conversation
              {conversations.length !== 1 ? "s" : ""}
            </p>
          </SheetHeader>
          {sidebarSearchBlock}
          <div className="flex min-h-0 flex-1 flex-col">{sidebarListBlock}</div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
