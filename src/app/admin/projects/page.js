"use client"

import * as React from "react"
import Link from "next/link"
import { Pencil, Trash2, Search, Eye } from "lucide-react"
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
import {
  listProjects,
  getProject,
  updateProject,
  deleteProject,
} from "@/lib/admin-api"
import AdminPagination from "@/components/admin/AdminPagination"
import toast from "react-hot-toast"

export default function AdminProjectsPage() {
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
    const { ok, data } = await listProjects(params)
    if (ok && data.type === "success") {
      setItems(data.items)
      setPagination(data.pagination)
    } else {
      toast.error(data.message || "Failed to load projects")
    }
    setLoading(false)
  }, [page, search])

  React.useEffect(() => {
    load()
  }, [load])

  const openEdit = async (id) => {
    const { ok, data } = await getProject(id)
    if (!ok || data.type !== "success") {
      toast.error(data.message || "Failed to load project")
      return
    }
    const p = data.project
    setEditForm({
      id: p._id,
      title: p.title || "",
      description: p.description || "",
      stage: p.stage || "",
      visibility: p.visibility || "public",
      industries: (p.industries || []).join(", "),
      tags: (p.tags || []).join(", "),
      website: p.links?.website || "",
      github: p.links?.github || "",
      demo: p.links?.demo || "",
    })
    setEditOpen(true)
  }

  const saveEdit = async () => {
    if (!editForm) return
    setSaving(true)
    const { ok, data } = await updateProject(editForm.id, {
      title: editForm.title,
      description: editForm.description,
      stage: editForm.stage,
      visibility: editForm.visibility,
      industries: editForm.industries,
      tags: editForm.tags,
      website: editForm.website,
      github: editForm.github,
      demo: editForm.demo,
    })
    setSaving(false)
    if (ok && data.type === "success") {
      toast.success(data.message || "Project updated")
      setEditOpen(false)
      load()
    } else {
      toast.error(data.message || "Update failed")
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Delete this project?")) return
    const { ok, data } = await deleteProject(id)
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
        <h1 className="text-2xl font-bold">Projects</h1>
        <p className="text-muted-foreground">Manage startup projects</p>
      </div>

      <div className="flex gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search title or description…"
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
              <th className="px-4 py-3 text-left font-medium">Owner</th>
              <th className="px-4 py-3 text-left font-medium">Stage</th>
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
                  No projects found
                </td>
              </tr>
            ) : (
              items.map((p) => (
                <tr key={p._id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">
                    <Link
                      href={`/admin/projects/${p._id}`}
                      className="text-primary hover:underline"
                    >
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.ownerId?.username || "—"}
                  </td>
                  <td className="px-4 py-3">{p.stage || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" asChild title="View details">
                        <Link href={`/admin/projects/${p._id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => openEdit(p._id)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDelete(p._id)}
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
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit project</DialogTitle>
          </DialogHeader>
          {editForm && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
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
                <Label>Stage</Label>
                <Input
                  value={editForm.stage}
                  onChange={(e) => setEditForm({ ...editForm, stage: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Visibility</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={editForm.visibility}
                  onChange={(e) =>
                    setEditForm({ ...editForm, visibility: e.target.value })
                  }
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Industries (comma-separated)</Label>
                <Input
                  value={editForm.industries}
                  onChange={(e) =>
                    setEditForm({ ...editForm, industries: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Tags (comma-separated)</Label>
                <Input
                  value={editForm.tags}
                  onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input
                    value={editForm.website}
                    onChange={(e) =>
                      setEditForm({ ...editForm, website: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>GitHub</Label>
                  <Input
                    value={editForm.github}
                    onChange={(e) =>
                      setEditForm({ ...editForm, github: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Demo</Label>
                  <Input
                    value={editForm.demo}
                    onChange={(e) => setEditForm({ ...editForm, demo: e.target.value })}
                  />
                </div>
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
