"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Shield, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { adminLogin } from "@/lib/admin-api"
import { useUserStore } from "@/store/store"
import toast from "react-hot-toast"
import Link from "next/link"

export default function AdminLoginPage() {
  const router = useRouter()
  const {
    SetUsername,
    SetIsLoggedIn,
    SetUserId,
    SetFullName,
    SetEmail,
    SetUserType,
    SetIsProfileComplete,
  } = useUserStore()
  const [form, setForm] = React.useState({ username: "", password: "" })
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    const token = localStorage.getItem("token")
    const userType = localStorage.getItem("userType")
    if (token && userType === "admin") {
      router.replace("/admin")
    }
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await adminLogin(form.username, form.password)
      if (res.type !== "success") {
        toast.error(res.message || "Login failed")
        return
      }
      if (res.user?.userType !== "admin") {
        toast.error("Admin access required. Use an admin account.")
        return
      }
      toast.success("Welcome, admin")
      SetUsername(res.user.username)
      SetIsLoggedIn(true)
      SetUserId(res.user.userId)
      SetFullName(res.user.fullName || "")
      SetEmail(res.user.email || "")
      SetUserType(res.user.userType)
      SetIsProfileComplete(Boolean(res.user.isProfileComplete))
      localStorage.setItem("token", res.token)
      localStorage.setItem("userId", res.user.userId)
      localStorage.setItem("userType", res.user.userType)
      localStorage.setItem(
        "isProfileComplete",
        String(Boolean(res.user.isProfileComplete))
      )
      router.push("/admin")
    } catch {
      toast.error("Could not connect to server")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <p className="text-sm text-muted-foreground">
            Sign in with your administrator account
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="admin"
                required
                minLength={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>
            <Button type="submit" className="w-full gap-2" disabled={loading}>
              <LogIn className="h-4 w-4" />
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline">
              Back to user login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
