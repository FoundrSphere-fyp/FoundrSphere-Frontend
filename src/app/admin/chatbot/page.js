"use client"

import * as React from "react"
import { Eye, Trash2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  listChatbotConversations,
  getChatbotConversation,
  deleteChatbotConversation,
} from "@/lib/admin-api"
import AdminPagination from "@/components/admin/AdminPagination"
import toast from "react-hot-toast"

export default function AdminChatbotPage() {
  const [items, setItems] = React.useState([])
  const [pagination, setPagination] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState("")
  const [viewOpen, setViewOpen] = React.useState(false)
  const [conversation, setConversation] = React.useState(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    const params = { page, limit: 15 }
    if (search.trim()) params.search = search.trim()
    const { ok, data } = await listChatbotConversations(params)
    if (ok && data.type === "success") {
      setItems(data.items)
      setPagination(data.pagination)
    } else {
      toast.error(data.message || "Failed to load conversations")
    }
    setLoading(false)
  }, [page, search])

  React.useEffect(() => {
    load()
  }, [load])

  const openView = async (id) => {
    const { ok, data } = await getChatbotConversation(id)
    if (!ok || data.type !== "success") {
      toast.error(data.message || "Failed to load conversation")
      return
    }
    setConversation(data.conversation)
    setViewOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm("Delete this conversation?")) return
    const { ok, data } = await deleteChatbotConversation(id)
    if (ok && data.type === "success") {
      toast.success(data.message || "Conversation deleted")
      load()
    } else {
      toast.error(data.message || "Delete failed")
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Chatbot</h1>
        <p className="text-muted-foreground">Review and moderate AI conversations</p>
      </header>

      <div className="flex gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search title or messages…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <Button variant="outline" onClick={load}>
          Refresh
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Title</th>
              <th className="px-4 py-3 text-left font-medium">User</th>
              <th className="px-4 py-3 text-left font-medium">Messages</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No conversations found
                </td>
              </tr>
            ) : (
              items.map((c) => (
                <tr key={c._id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{c.title || "Untitled"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.userId?.username || "—"}
                  </td>
                  <td className="px-4 py-3">{c.messageCount ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openView(c._id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDelete(c._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AdminPagination pagination={pagination} onPageChange={setPage} />

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{conversation?.title || "Conversation"}</DialogTitle>
          </DialogHeader>
          {conversation && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                User: {conversation.userId?.username} ({conversation.userId?.email})
              </p>
              <div className="space-y-2">
                {(conversation.messages || []).map((msg, i) => (
                  <div
                    key={i}
                    className={`rounded-lg p-3 text-sm ${
                      msg.role === "user"
                        ? "bg-primary/10 ml-4"
                        : "bg-muted mr-4"
                    }`}
                  >
                    <p className="mb-1 text-xs font-medium capitalize text-muted-foreground">
                      {msg.role}
                    </p>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
