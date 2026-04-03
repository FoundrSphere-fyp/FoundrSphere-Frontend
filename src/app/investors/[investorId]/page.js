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
  TrendingUp,
  ExternalLink,
} from "lucide-react"
import toast from "react-hot-toast"
import { fetchInvestorDetail } from "@/lib/profile-api"

function amountHidden(visibility) {
  return String(visibility || "")
    .toLowerCase()
    .includes("hidden")
}

export default function InvestorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const investorId = params?.investorId

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [msgLoading, setMsgLoading] = useState(false)

  useEffect(() => {
    if (!investorId) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const res = await fetchInvestorDetail(investorId)
        if (cancelled) return
        if (res.type === "success") {
          setData(res)
        } else {
          toast.error(res.message || "Could not load investor")
          setData(null)
        }
      } catch {
        if (!cancelled) toast.error("Failed to load investor")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [investorId])

  const startConversation = async () => {
    if (!data?.investor?._id) return
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
          body: JSON.stringify({ receiverId: data.investor._id }),
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

  if (!data?.investor) {
    return (
      <div className="mx-auto max-w-2xl p-8 text-center">
        <p className="text-muted-foreground">Investor not found.</p>
        <Button asChild className="mt-4">
          <Link href="/investors">Back to investors</Link>
        </Button>
      </div>
    )
  }

  const { investor, investorProfile, projects = [], investments = [] } = data
  const visibleProjects = projects.filter(
    (p) => !p.visibility || p.visibility === "public"
  )
  const visibleInvestments = investments.filter((inv) => {
    const p = inv.projectId
    return (
      p &&
      typeof p === "object" &&
      (!p.visibility || p.visibility === "public")
    )
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-8 pb-16">
      <div className="mx-auto max-w-4xl space-y-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/investors" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            All investors
          </Link>
        </Button>

        <Card>
          <CardHeader className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-3xl font-bold text-white">
              {investor.fullName?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-3xl">
                  {investor.fullName || "Investor"}
                </CardTitle>
                <Badge variant="secondary">
                  <Briefcase className="mr-1 h-3 w-3" />
                  Investor
                </Badge>
              </div>
              <p className="text-muted-foreground">@{investor.username}</p>
              {investor.email && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  {investor.email}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Member since{" "}
                {new Date(investor.createdAt).toLocaleDateString("en-US", {
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
          {investor.bio && (
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {investor.bio}
              </p>
            </CardContent>
          )}
        </Card>

        {investorProfile && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <TrendingUp className="h-5 w-5" />
                Investment profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {investorProfile.firmName && (
                  <div>
                    <p className="text-xs text-muted-foreground">Firm</p>
                    <p className="font-semibold">{investorProfile.firmName}</p>
                  </div>
                )}
                {investorProfile.investorType && (
                  <div>
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p>{investorProfile.investorType}</p>
                  </div>
                )}
                {(investorProfile.checkSizeMin != null ||
                  investorProfile.checkSizeMax != null) && (
                  <div className="flex items-start gap-2 text-sm sm:col-span-2">
                    <DollarSign className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <span>
                      Check size:{" "}
                      {investorProfile.checkSizeMin != null
                        ? Number(investorProfile.checkSizeMin).toLocaleString()
                        : "—"}{" "}
                      –{" "}
                      {investorProfile.checkSizeMax != null
                        ? Number(investorProfile.checkSizeMax).toLocaleString()
                        : "—"}
                    </span>
                  </div>
                )}
              </div>
              {investorProfile.preferredIndustries?.length > 0 && (
                <div>
                  <p className="mb-2 text-xs text-muted-foreground">
                    Preferred industries
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {investorProfile.preferredIndustries.map((i) => (
                      <Badge key={i} variant="outline">
                        {i}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {investorProfile.preferredStages?.length > 0 && (
                <div>
                  <p className="mb-2 text-xs text-muted-foreground">
                    Preferred stages
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {investorProfile.preferredStages.map((s) => (
                      <Badge key={s} variant="secondary">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {investorProfile.locations?.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {investorProfile.locations.join(", ")}
                </div>
              )}
              {investorProfile.investmentThesis && (
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Thesis</p>
                  <p className="text-sm leading-relaxed">
                    {investorProfile.investmentThesis}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div>
          <h2 className="mb-4 text-2xl font-semibold">Invested projects</h2>
          {visibleProjects.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              No public projects listed yet.
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {visibleProjects.map((p) => (
                <Card key={p._id}>
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between gap-2 text-lg">
                      <span className="line-clamp-2">{p.title}</span>
                      {p.stage && (
                        <Badge variant="outline" className="shrink-0">
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
                    {p.ownerId &&
                      typeof p.ownerId === "object" &&
                      p.ownerId.fullName && (
                        <p className="text-xs text-muted-foreground">
                          Founder: {p.ownerId.fullName}
                        </p>
                      )}
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <Link href={`/projects/${p._id}`}>
                        View project
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {visibleInvestments.length > 0 && (
          <div>
            <h2 className="mb-4 text-2xl font-semibold">
              Investment rounds (public)
            </h2>
            <Card>
              <CardContent className="divide-y p-0">
                {visibleInvestments.map((inv) => {
                  const proj =
                    typeof inv.projectId === "object" && inv.projectId
                      ? inv.projectId
                      : null
                  const hidden = amountHidden(inv.visibility)
                  return (
                    <div
                      key={inv._id}
                      className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
                    >
                      <span className="font-medium">
                        {proj?.title || "Project"}
                      </span>
                      <span className="text-muted-foreground">
                        {hidden
                          ? "Amount hidden"
                          : `${inv.amount ?? "—"} ${inv.currency || "USD"}`}{" "}
                        · {inv.stage || "—"}
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
