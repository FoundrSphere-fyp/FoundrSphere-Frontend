"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Loader2,
  MessageCircle,
  Mail,
  Briefcase,
  MapPin,
  DollarSign,
  Rocket,
  ExternalLink,
} from "lucide-react"
import toast from "react-hot-toast"
import { fetchFounderDetail } from "@/lib/profile-api"

function amountHidden(visibility) {
  return String(visibility || "")
    .toLowerCase()
    .includes("hidden")
}

export default function FounderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const founderId = params?.founderId

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [msgLoading, setMsgLoading] = useState(false)

  useEffect(() => {
    if (!founderId) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const res = await fetchFounderDetail(founderId)
        if (cancelled) return
        if (res.type === "success") {
          setData(res)
        } else {
          toast.error(res.message || "Could not load founder")
          setData(null)
        }
      } catch {
        if (!cancelled) toast.error("Failed to load founder")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [founderId])

  const startConversation = async () => {
    if (!data?.founder?._id) return
    try {
      setMsgLoading(true)
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/messages/get-or-create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ receiverId: data.founder._id }),
        }
      )
      const json = await res.json()
      if (json.type === "success") {
        router.push(`/chat/${json.conversation._id}`)
      } else {
        toast.error(json.message || "Could not start chat")
      }
    } catch {
      toast.error("Could not start chat")
    } finally {
      setMsgLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (!data?.founder) {
    return (
      <div className="mx-auto max-w-2xl p-8 text-center">
        <p className="text-muted-foreground">Founder not found.</p>
        <Button asChild className="mt-4">
          <Link href="/founders">Back to founders</Link>
        </Button>
      </div>
    )
  }

  const { founder, founderProfile, projects = [], investments = [] } = data

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-8 pb-16">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/founders" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              All founders
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-3xl font-bold text-white">
              {founder.fullName?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-3xl">
                  {founder.fullName || "Founder"}
                </CardTitle>
                <Badge variant="secondary">
                  <Briefcase className="mr-1 h-3 w-3" />
                  Founder
                </Badge>
              </div>
              <p className="text-muted-foreground">@{founder.username}</p>
              {founder.email && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  {founder.email}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Member since{" "}
                {new Date(founder.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <Button
                className="mt-2 w-full sm:w-auto"
                onClick={startConversation}
                disabled={msgLoading}
              >
                {msgLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <MessageCircle className="mr-2 h-4 w-4" />
                )}
                Send message
              </Button>
            </div>
          </CardHeader>
          {founder.bio && (
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {founder.bio}
              </p>
            </CardContent>
          )}
        </Card>

        {founderProfile && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Rocket className="h-5 w-5" />
                Startup profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {founderProfile.startupName && (
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">
                    Startup
                  </p>
                  <p className="text-lg font-semibold">
                    {founderProfile.startupName}
                  </p>
                </div>
              )}
              {founderProfile.description && (
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">
                    About
                  </p>
                  <p className="text-sm leading-relaxed">
                    {founderProfile.description}
                  </p>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {founderProfile.industries?.map((i) => (
                  <Badge key={i} variant="outline">
                    {i}
                  </Badge>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {founderProfile.stage && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Stage:</span>
                    {founderProfile.stage}
                  </div>
                )}
                {founderProfile.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {founderProfile.location}
                  </div>
                )}
                {founderProfile.fundingNeeded != null && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    Funding sought:{" "}
                    {Number(founderProfile.fundingNeeded).toLocaleString()}
                  </div>
                )}
                {founderProfile.businessModel && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Model:</span>{" "}
                    {founderProfile.businessModel}
                  </div>
                )}
              </div>
              {founderProfile.traction && (
                <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                  <p className="font-medium">Traction</p>
                  <p className="text-muted-foreground">
                    Users:{" "}
                    {founderProfile.traction.users?.toLocaleString() ?? "—"} ·
                    Revenue:{" "}
                    {founderProfile.traction.revenue?.toLocaleString() ?? "—"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div>
          <h2 className="mb-4 text-2xl font-semibold">Projects</h2>
          {projects.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              No public projects yet.
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((p) => (
                <Card key={p._id} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between gap-2 text-lg">
                      <span className="line-clamp-2">{p.title}</span>
                      {p.stage && (
                        <Badge variant="secondary" className="shrink-0">
                          {p.stage}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {p.description && (
                      <p className="line-clamp-3 text-sm text-muted-foreground">
                        {p.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {(p.industries || []).slice(0, 4).map((ind) => (
                        <Badge key={ind} variant="outline" className="text-xs">
                          {ind}
                        </Badge>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <Link href={`/projects/${p._id}`}>
                        Open project
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {investments.length > 0 && (
          <div>
            <h2 className="mb-4 text-2xl font-semibold">
              Activity on public investments
            </h2>
            <Card>
              <CardContent className="divide-y p-0">
                {investments.slice(0, 24).map((inv) => {
                  const invName =
                    typeof inv.investorId === "object" && inv.investorId
                      ? inv.investorId.fullName || inv.investorId.username
                      : "Investor"
                  const projTitle =
                    typeof inv.projectId === "object" && inv.projectId
                      ? inv.projectId.title
                      : "Project"
                  const hidden = amountHidden(inv.visibility)
                  return (
                    <div
                      key={inv._id}
                      className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
                    >
                      <span>
                        <span className="font-medium">{invName}</span>
                        <span className="text-muted-foreground">
                          {" "}
                          · {projTitle}
                        </span>
                      </span>
                      <span className="text-muted-foreground">
                        {hidden
                          ? "Amount hidden"
                          : `${inv.amount ?? "—"} ${inv.currency || "USD"}`}
                      </span>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
