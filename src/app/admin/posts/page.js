"use client"

import * as React from "react"
import { Pencil, Trash2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { listPosts, getPost, updatePost, deletePost } from "@/lib/admin-api"
import AdminPagination from "@/components/admin/AdminPagination"
import toast from "react-hot-toast"

export default function AdminPostsPage() {
  const [items, setItems] = React.useState([])
  const [pagination, setPagination] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState("")
  const [editOpen, setEditOpen] = React.useState(false)
  const [editForm, setEditForm] = React.useState(null)
  const [saving, setSaving] = React.useState(false)

  const load = React.useCallback(async () => {
    setLoading(true)
    const params = { page, limit: 15 }
    if (search.trim()) params.search = search.trim()
    const { ok, data } = await listPosts(params)
    if (ok && data.type === "success") {
      setItems(data.items)
      setPagination(data.pagination)
    } else {
      toast.error(data.message || "Failed to load posts")
    }
    setLoading(false)
  }, [page, search])

  React.useEffect(() => {
    load()
  }, [load])

  const openEdit = async (id) => {
    const { ok, data } = await getPost(id)
    if (!ok || data.type !== "success") {
      toast.error(data.message || "Failed to load post")
      return
    }
    setEditForm({ id: data.post._id, content: data.post.content || "" })
    setEditOpen(true)
  }

  const saveEdit = async () => {
    if (!editForm) return
    setSaving(true)
    const { ok, data } = await updatePost(editForm.id, { content: editForm.content })
    setSaving(false)
    if (ok && data.type === "success") {
      toast.success(data.message || "Post updated")
      setEditOpen(false)
      load()
    } else {
      toast.error(data.message || "Update failed")
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Delete this post?")) return
    const { ok, data } = await deletePost(id)
    if (ok && data.type === "success") {
      toast.success(data.message)
      load()
    } else {
      toast.error(data.message || "Delete failed")
    }
  }

  const truncate = (text, len = 80) => {
    if (!text) return "—"
    return text.length > len ? `${text.slice(0, len)}…` : text
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Posts</h1>
        <p className="text-muted-foreground">Manage group posts</p>
      </div>

      <div className="flex gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search content…"
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
              <th className="px-4 py-3 text-left font-medium">Content</th>
              <th className="px-4 py-3 text-left font-medium">Author</th>
              <th className="px-4 py-3 text-left font-medium">Group</th>
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
                  No posts found
                </td>
              </tr>
            ) : (
              items.map((post) => (
                <tr key={post._id} className="border-b border-border last:border-0">
                  <td className="max-w-xs px-4 py-3">{truncate(post.content)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {post.author?.username || "—"}
                  </td>
                  <td className="px-4 py-3">{post.groupId?.name || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(post._id)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDelete(post._id)}
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

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit post</DialogTitle>
          </DialogHeader>
          {editForm && (
            <div className="space-y-2">
              <Label>Content</Label>
              <textarea
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveEdit} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
