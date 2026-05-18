"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin/AdminSidebar"
import { getAdminToken } from "@/lib/admin-api"

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const isLoginPage = pathname === "/admin/login"
  const [ready, setReady] = useState(isLoginPage)

  useEffect(() => {
    if (isLoginPage) {
      setReady(true)
      return
    }

    const token = getAdminToken()
    const userType = localStorage.getItem("userType")

    if (!token || userType !== "admin") {
      router.replace("/admin/login")
      return
    }

    setReady(true)
  }, [isLoginPage, pathname, router])

  if (isLoginPage) {
    return <>{children}</>
  }

  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        Loading admin panel…
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  )
}
