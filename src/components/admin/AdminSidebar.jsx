"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  UsersRound,
  FileText,
  Bot,
  LogOut,
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useUserStore } from "@/store/store"

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/groups", label: "Groups", icon: UsersRound },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/chatbot", label: "Chatbot", icon: Bot },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const {
    SetIsLoggedIn,
    SetUsername,
    SetUserId,
    SetFullName,
    SetEmail,
    SetUserType,
    SetIsProfileComplete,
  } = useUserStore()

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    localStorage.removeItem("userType")
    localStorage.removeItem("isProfileComplete")
    SetIsLoggedIn(false)
    SetUsername("")
    SetUserId("")
    SetFullName("")
    SetEmail("")
    SetUserType("")
    SetIsProfileComplete(false)
    router.push("/admin/login")
  }

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-card/50">
      <div className="flex items-center gap-2 border-b border-border px-4 py-5">
        <Shield className="h-6 w-6 text-primary" />
        <div>
          <p className="text-sm font-semibold">FoundrSphere</p>
          <p className="text-xs text-muted-foreground">Admin Panel</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-border p-3">
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </aside>
  )
}
