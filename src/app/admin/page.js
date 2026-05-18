"use client"

import * as React from "react"
import {
  Users,
  UserCheck,
  UserX,
  Briefcase,
  UsersRound,
  FileText,
  Bot,
  FolderKanban,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getStats } from "@/lib/admin-api"
import toast from "react-hot-toast"

const statCards = [
  { key: "totalUsers", label: "Total Users", icon: Users },
  { key: "activeUsers", label: "Active Users", icon: UserCheck },
  { key: "disabledUsers", label: "Disabled Users", icon: UserX },
  { key: "foundersCount", label: "Founders", icon: Briefcase },
  { key: "investorsCount", label: "Investors", icon: Briefcase },
  { key: "adminsCount", label: "Admins", icon: Users },
  { key: "projectsCount", label: "Projects", icon: FolderKanban },
  { key: "groupsCount", label: "Groups", icon: UsersRound },
  { key: "postsCount", label: "Posts", icon: FileText },
  { key: "chatbotConversationsCount", label: "Chatbot Chats", icon: Bot },
]

export default function AdminDashboardPage() {
  const [stats, setStats] = React.useState(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    ;(async () => {
      const { ok, data } = await getStats()
      if (ok && data.type === "success") {
        setStats(data.stats)
      } else {
        toast.error(data.message || "Failed to load stats")
      }
      setLoading(false)
    })()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and key metrics</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading statistics…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {statCards.map(({ key, label, icon: Icon }) => (
            <Card key={key}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {label}
                </CardTitle>
                <Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats?.[key] ?? 0}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
