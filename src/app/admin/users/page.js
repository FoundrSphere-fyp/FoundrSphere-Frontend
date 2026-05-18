"use client"

import * as React from "react"
import { Pencil, Trash2, Power, PowerOff, Search } from "lucide-react"
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
  listUsers,
  getUser,
  updateUser,
  updateUserStatus,
  deleteUser,
} from "@/lib/admin-api"
import AdminPagination from "@/components/admin/AdminPagination"
import toast from "react-hot-toast"

export default function AdminUsersPage() {
  const [items, setItems] = React.useState([])
  const [pagination, setPagination] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState("")
  const [userType, setUserType] = React.useState("")
  const [isActive, setIsActive] = React.useState("")
  const [editOpen, setEditOpen] = React.useState(false)
  const [editForm, setEditForm] = React.useState(null)
  const [saving, setSaving] = React.useState(false)

  const load = React.useCallback(async () => {
    setLoading(true)
    const params = { page, limit: 15 }
    if (search.trim()) params.search = search.trim()
    if (userType) params.userType = userType
    if (isActive !== "") params.isActive = isActive

    const { ok, data } = await listUsers(params)
    if (ok && data.type === "success") {
      setItems(data.items)
      setPagination(data.pagination)
    } else {
      toast.error(data.message || "Failed to load users")
    }
    setLoading(false)
  }, [page, search, userType, isActive])

  React.useEffect(() => {
    load()
  }, [load])

  const openEdit = async (id) => {
    const { ok, data } = await getUser(id)
    if (!ok || data.type !== "success") {
      toast.error(data.message || "Failed to load user")
      return
    }
    const u = data.user
    setEditForm({
      id: u._id,
      fullName: u.fullName || "",
      email: u.email || "",
      username: u.username || "",
      userType: u.userType || "founder",
      bio: u.bio || "",
      isActive: u.isActive !== false,
    })
    setEditOpen(true)
  }

  const saveEdit = async () => {
    if (!editForm) return
    setSaving(true)
    const { ok, data } = await updateUser(editForm.id, {
      fullName: editForm.fullName,
      email: editForm.email,
      username: editForm.username,
      userType: editForm.userType,
      bio: editForm.bio,
      isActive: editForm.isActive,
    })
    setSaving(false)
    if (ok && data.type === "success") {
      toast.success(data.message || "User updated")
      setEditOpen(false)
      load()
    } else {
      toast.error(data.message || "Update failed")
    }
  }

  const toggleStatus = async (user) => {
    const next = user.isActive === false
    const { ok, data } = await updateUserStatus(user._id, next)
    if (ok && data.type === "success") {
      toast.success(data.message)
      load()
    } else {
      toast.error(data.message || "Status update failed")
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Delete this user and all related data?")) return
    const { ok, data } = await deleteUser(id)
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
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground">Manage platform accounts</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search username, email, name…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={userType}
          onChange={(e) => {
            setUserType(e.target.value)
            setPage(1)
          }}
        >
          <option value="">All types</option>
          <option value="founder">Founder</option>
          <option value="investor">Investor</option>
          <option value="admin">Admin</option>
        </select>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={isActive}
          onChange={(e) => {
            setIsActive(e.target.value)
            setPage(1)
          }}
        >
          <option value="">All status</option>
          <option value="true">Active</option>
          <option value="false">Disabled</option>
        </select>
        <Button variant="outline" onClick={() => load()}>
          Refresh
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">User</th>
              <th className="px-4 py-3 text-left font-medium">Type</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
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
                  No users found
                </td>
              </tr>
            ) : (
              items.map((user) => (
                <tr key={user._id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{user.fullName || user.username}</p>
                    <p className="text-xs text-muted-foreground">@{user.username} · {user.email}</p>
                  </td>
                  <td className="px-4 py-3 capitalize">{user.userType}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        user.isActive !== false
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {user.isActive !== false ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(user._id)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => toggleStatus(user)}>
                        {user.isActive !== false ? (
                          <PowerOff className="h-4 w-4" />
                        ) : (
                          <Power className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDelete(user._id)}
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
            <DialogTitle>Edit user</DialogTitle>
          </DialogHeader>
          {editForm && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Full name</Label>
                <Input
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={editForm.userType}
                  onChange={(e) => setEditForm({ ...editForm, userType: e.target.value })}
                >
                  <option value="founder">Founder</option>
                  <option value="investor">Investor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Input
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                />
                Account active
              </label>
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
