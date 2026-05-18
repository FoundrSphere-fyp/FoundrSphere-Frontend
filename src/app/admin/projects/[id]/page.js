"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  DollarSign,
  Users,
  Globe,
  Github,
  PlayCircle,
  Trash2,
  Loader2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getProject, deleteProject } from "@/lib/admin-api"
import toast from "react-hot-toast"

function formatMoney(amount, currency = "USD") {
  if (amount == null) return "—"
  return `${Number(amount).toLocaleString()} ${currency}`
}

export default function AdminProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params?.id

  const [loading, setLoading] = React.useState(true)
  const [data, setData] = React.useState(null)

  const load = React.useCallback(async () => {
    if (!projectId) return
    setLoading(true)
    const { ok, data: res } = await getProject(projectId)
    setLoading(false)
    if (!ok || res?.type !== "success") {
      toast.error(res?.message || "Failed to load project")
      setData(null)
      return
    }
    setData(res)
  }, [projectId])

  React.useEffect(() => {
    load()
  }, [load])

  const handleDelete = async () => {
    if (!confirm("Delete this project and all related investments?")) return
    const { ok, data: res } = await deleteProject(projectId)
    if (ok && res?.type === "success") {
      toast.success(res.message || "Project deleted")
      router.push("/admin/projects")
    } else {
      toast.error(res?.message || "Delete failed")
    }
  }

  if (loading) {
    return (
      <section className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </section>
    )
  }

  if (!data?.project) {
    return (
      <section className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/projects" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to projects
          </Link>
        </Button>
        <p className="text-muted-foreground">Project not found.</p>
      </section>
    )
  }

  const p = data.project
  const summary = data.fundingSummary
  const investments = data.investments || []
  const links = p.links || {}

  return (
    <section className="mx-auto max-w-4xl space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/projects" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to projects
          </Link>
        </Button>
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete project
        </Button>
      </header>

      <article>
        <h1 className="text-2xl font-bold">{p.title}</h1>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {p.stage && <Badge variant="secondary">{p.stage}</Badge>}
          <Badge variant="outline">{p.visibility}</Badge>
          <span>
            Created {new Date(p.createdAt).toLocaleDateString()}
            {p.updatedAt &&
              ` · Updated ${new Date(p.updatedAt).toLocaleDateString()}`}
          </span>
        </p>
      </article>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Owner</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <p className="font-medium">
            {p.ownerId?.fullName || p.ownerId?.username || "—"}
          </p>
          <p className="text-muted-foreground">
            @{p.ownerId?.username} · {p.ownerId?.email}
          </p>
          <p className="capitalize text-muted-foreground">
            {p.ownerType} · {p.ownerId?.userType}
            {p.ownerId?.isActive === false && " · disabled"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {p.description}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              Users:{" "}
              <span className="font-medium">
                {(p.metrics?.users ?? 0).toLocaleString()}
              </span>
            </p>
            <p>
              Revenue:{" "}
              <span className="font-medium">
                {(p.metrics?.revenue ?? 0).toLocaleString()}
              </span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Links</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {links.website ? (
              <a
                href={links.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <Globe className="h-4 w-4" />
                Website
              </a>
            ) : null}
            {links.github ? (
              <a
                href={links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            ) : null}
            {links.demo ? (
              <a
                href={links.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <PlayCircle className="h-4 w-4" />
                Demo
              </a>
            ) : null}
            {!links.website && !links.github && !links.demo && (
              <p className="text-muted-foreground">No links</p>
            )}
          </CardContent>
        </Card>
      </div>

      {(p.industries?.length > 0 || p.tags?.length > 0) && (
        <section className="space-y-4">
          {p.industries?.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                Industries
              </p>
              <ul className="flex flex-wrap gap-2">
                {p.industries.map((i) => (
                  <li key={i}>
                    <Badge variant="outline">{i}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {p.tags?.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                Tags
              </p>
              <ul className="flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <li key={t}>
                    <Badge variant="secondary">{t}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-4 w-4" />
            Funding summary
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <p>
            Total rounds:{" "}
            <span className="font-medium">{summary?.totalInvestments ?? 0}</span>
          </p>
          <p>
            Disclosed total:{" "}
            <span className="font-medium">
              {formatMoney(summary?.totalAmount, "USD")}
            </span>
          </p>
          {summary?.currencies &&
            Object.entries(summary.currencies).map(([cur, amt]) => (
              <p key={cur}>
                Total ({cur}):{" "}
                <span className="font-medium">{formatMoney(amt, cur)}</span>
              </p>
            ))}
          <p className="sm:col-span-2 text-muted-foreground">
            Visibility: public {summary?.byVisibility?.public ?? 0}, private{" "}
            {summary?.byVisibility?.private ?? 0}, amount hidden{" "}
            {summary?.byVisibility?.amount_hidden ?? 0}
          </p>
        </CardContent>
      </Card>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Investment rounds</h2>
        {investments.length === 0 ? (
          <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No investments recorded for this project.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Investor</th>
                  <th className="px-4 py-3 text-left font-medium">Amount</th>
                  <th className="px-4 py-3 text-left font-medium">Stage</th>
                  <th className="px-4 py-3 text-left font-medium">Visibility</th>
                  <th className="px-4 py-3 text-left font-medium">Conviction</th>
                  <th className="px-4 py-3 text-left font-medium">Notes</th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((inv) => (
                  <tr
                    key={inv._id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium">
                        {inv.investorId?.fullName ||
                          inv.investorId?.username ||
                          "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @{inv.investorId?.username} · {inv.investorId?.email}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatMoney(inv.amount, inv.currency || "USD")}
                    </td>
                    <td className="px-4 py-3">{inv.stage || "—"}</td>
                    <td className="px-4 py-3 capitalize">
                      {inv.visibility || "public"}
                    </td>
                    <td className="px-4 py-3">{inv.convictionLevel ?? "—"}</td>
                    <td className="max-w-xs px-4 py-3 text-muted-foreground">
                      {inv.notes || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {inv.createdAt
                        ? new Date(inv.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  )
}
