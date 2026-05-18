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
import { listGroups, getGroup, updateGroup, deleteGroup } from "@/lib/admin-api"
import AdminPagination from "@/components/admin/AdminPagination"
import toast from "react-hot-toast"

export default function AdminGroupsPage() {
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
    const { ok, data } = await listGroups(params)
    if (ok && data.type === "success") {
      setItems(data.items)
      setPagination(data.pagination)
    } else {
      toast.error(data.message || "Failed to load groups")
    }
    setLoading(false)
  }, [page, search])

  React.useEffect(() => {
    load()
  }, [load])

  const openEdit = async (id) => {
    const { ok, data } = await getGroup(id)
    if (!ok || data.type !== "success") {
      toast.error(data.message || "Failed to load group")
      return
    }
    const g = data.group
    setEditForm({
      id: g._id,
      name: g.name || "",
      description: g.description || "",
      topic: g.topic || "",
      visibility: g.visibility || "",
      icon: g.icon || "",
      memberCount: g.memberCount ?? 0,
    })
    setEditOpen(true)
  }

  const saveEdit = async () => {
    if (!editForm) return
    setSaving(true)
    const { ok, data } = await updateGroup(editForm.id, {
      name: editForm.name,
      description: editForm.description,
      topic: editForm.topic,
      visibility: editForm.visibility,
      icon: editForm.icon,
      memberCount: Number(editForm.memberCount),
    })
    setSaving(false)
    if (ok && data.type === "success") {
      toast.success(data.message || "Group updated")
      setEditOpen(false)
      load()
    } else {
      toast.error(data.message || "Update failed")
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Delete this group?")) return
    const { ok, data } = await deleteGroup(id)
    if (ok && data.type === "success") {
      toast.success(data.message)
      load()
    } else {
      toast.error(data.message || "Delete failed")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Groups</h1>
        <p className="text-muted-foreground">Manage community groups</p>
      </div>

      <div className="flex gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search name, topic…"
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
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Topic</th>
              <th className="px-4 py-3 text-left font-medium">Members</th>
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
                  No groups found
                </td>
              </tr>
            ) : (
              items.map((g) => (
                <tr key={g._id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{g.name}</td>
                  <td className="px-4 py-3">{g.topic || "—"}</td>
                  <td className="px-4 py-3">{g.memberCount ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(g._id)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDelete(g._id)}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit group</DialogTitle>
          </DialogHeader>
          {editForm && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Topic</Label>
                <Input
                  value={editForm.topic}
                  onChange={(e) => setEditForm({ ...editForm, topic: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Visibility</Label>
                <Input
                  value={editForm.visibility}
                  onChange={(e) =>
                    setEditForm({ ...editForm, visibility: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Member count</Label>
                <Input
                  type="number"
                  min={0}
                  value={editForm.memberCount}
                  onChange={(e) =>
                    setEditForm({ ...editForm, memberCount: e.target.value })
                  }
                />
              </div>
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
