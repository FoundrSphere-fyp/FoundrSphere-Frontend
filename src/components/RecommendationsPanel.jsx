"use client"

import * as React from "react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, MessageCircle, Sparkles } from "lucide-react"
import {
  fetchRecommendInvestors,
  fetchRecommendFounders,
  formatFitHints,
  STRONG_MATCH_MIN,
} from "@/lib/recommendations"
import Link from "next/link"
import { useRouter } from "next/navigation"

/**
 * Full-page recommendations list (no modal). Fetches when `active` becomes true.
 * @param {'investors'|'founders'} mode
 * @param {boolean} active - when false, renders nothing
 */
export default function RecommendationsPanel({ mode, active }) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [items, setItems] = React.useState([])
  const [msgLoading, setMsgLoading] = React.useState(null)

  React.useEffect(() => {
    if (!active) {
      return
    }
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setItems([])
      try {
        const data =
          mode === "investors"
            ? await fetchRecommendInvestors()
            : await fetchRecommendFounders()
        if (cancelled) return
        if (data.type === "success") {
          setItems(data.recommendations || [])
        } else {
          toast.error(data.message || "Could not load recommendations.")
          setItems([])
        }
      } catch {
        if (!cancelled) toast.error("Failed to load recommendations.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [active, mode])

  const startConversation = async (receiverId) => {
    if (!receiverId) return
    try {
      setMsgLoading(receiverId)
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/messages/get-or-create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ receiverId }),
        }
      )
      const data = await res.json()
      if (data.type === "success") {
        router.push(`/chat/${data.conversation._id}`)
      } else {
        toast.error(data.message || "Failed to start conversation")
      }
    } catch {
      toast.error("Failed to start conversation")
    } finally {
      setMsgLoading(null)
    }
  }

  if (!active) return null

  const title =
    mode === "investors"
      ? "Recommended investors"
      : "Recommended founders & startups"

  const subtitle =
    mode === "investors"
      ? "Ranked for your founder profile (semantic fit + industry, stage, check size, location)."
      : "Ranked for your investor profile (semantic fit + preferences)."

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center py-16">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">
          Finding your best matches…
        </p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <Card className="border-dashed p-12 text-center">
        <Sparkles className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground">
          No recommendations yet. Complete your profile and try again.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h2 className="flex items-center justify-center gap-2 text-xl font-semibold sm:justify-start">
          <Sparkles className="h-5 w-5 text-amber-500" />
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          {items.length} result{items.length !== 1 ? "s" : ""} · Scroll to explore
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((row, index) => {
          const isTop = index === 0
          const strong = row.score >= STRONG_MATCH_MIN
          const highlight = isTop && strong
          const weakTop = isTop && !strong

          if (mode === "investors") {
            const inv = row.investor || {}
            const iu = row.investorUser
            const firmTitle = inv.firmName?.trim() || "Investor"
            const userId = inv.userId
            const hints = formatFitHints(row.breakdown)

            return (
              <Card
                key={String(inv._id || userId || index)}
                className={
                  highlight
                    ? "border-2 border-amber-400 bg-amber-50/80 shadow-md dark:bg-amber-950/20"
                    : weakTop
                      ? "border border-muted-foreground/30 bg-muted/30"
                      : ""
                }
              >
                <CardHeader className="space-y-2">
                  {isTop && (
                    <Badge variant={strong ? "default" : "secondary"}>
                      {strong ? "Top match" : "Best available (weak fit)"}
                    </Badge>
                  )}
                  {iu && (iu.fullName || iu.username) && (
                    <p className="text-sm">
                      <span className="font-semibold text-primary">
                        {iu.fullName || iu.username}
                      </span>
                      {iu.username && (
                        <span className="text-muted-foreground">
                          {" "}
                          @{iu.username}
                        </span>
                      )}
                    </p>
                  )}
                  <CardTitle className="text-lg">{firmTitle}</CardTitle>
                  {inv.investorType && (
                    <p className="text-sm text-muted-foreground">
                      {inv.investorType}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {hints && (
                    <p className="text-xs text-muted-foreground">{hints}</p>
                  )}
                  {inv.investmentThesis && (
                    <p className="line-clamp-4 text-sm text-muted-foreground">
                      {inv.investmentThesis}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
                    <span className="rounded-md bg-muted px-2 py-1 text-xs font-semibold">
                      Score {Number(row.score).toFixed(2)}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {userId && (
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/investors/${userId}`}>Profile</Link>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        disabled={!userId || msgLoading === String(userId)}
                        onClick={() => startConversation(String(userId))}
                      >
                        {msgLoading === String(userId) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Message
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          }

          const fp = row.founder || {}
          const fu = row.founderUser
          const startup = fp.startupName?.trim() || "Startup"
          const userId = fp.userId
          const hints = formatFitHints(row.breakdown)

          return (
            <Card
              key={String(fp._id || userId || index)}
              className={
                highlight
                  ? "border-2 border-amber-400 bg-amber-50/80 shadow-md dark:bg-amber-950/20"
                  : weakTop
                    ? "border border-muted-foreground/30 bg-muted/30"
                    : ""
              }
            >
              <CardHeader className="space-y-2">
                {isTop && (
                  <Badge variant={strong ? "default" : "secondary"}>
                    {strong ? "Top match" : "Best available (weak fit)"}
                  </Badge>
                )}
                {fu && (fu.fullName || fu.username) && (
                  <p className="text-sm">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {fu.fullName || fu.username}
                    </span>
                    {fu.username && (
                      <span className="text-muted-foreground">
                        {" "}
                        @{fu.username}
                      </span>
                    )}
                  </p>
                )}
                <CardTitle className="text-lg">{startup}</CardTitle>
                {(fp.stage || fp.location) && (
                  <p className="text-sm text-muted-foreground">
                    {[fp.stage, fp.location].filter(Boolean).join(" · ")}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {hints && (
                  <p className="text-xs text-muted-foreground">{hints}</p>
                )}
                {fp.description && (
                  <p className="line-clamp-4 text-sm text-muted-foreground">
                    {fp.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
                  <span className="rounded-md bg-muted px-2 py-1 text-xs font-semibold">
                    Score {Number(row.score).toFixed(2)}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {userId && (
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/founders/${userId}`}>Profile</Link>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      disabled={!userId || msgLoading === String(userId)}
                      onClick={() => startConversation(String(userId))}
                    >
                      {msgLoading === String(userId) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Message
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
