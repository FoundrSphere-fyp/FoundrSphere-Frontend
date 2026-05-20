"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Loader2,
  Globe,
  Github,
  PlayCircle,
  Users,
  DollarSign,
  Building2,
  Pencil,
  TrendingUp,
} from "lucide-react"
import toast from "react-hot-toast"
import { fetchPublicProject } from "@/lib/profile-api"
import { updateProject, createInvestment } from "@/lib/projects-api"
import { cn } from "@/lib/utils"
import {
  INDUSTRY_OPTIONS,
  FUNDING_STAGE_OPTIONS,
} from "@/lib/select-options"

function amountHidden(visibility) {
  return String(visibility || "")
    .toLowerCase()
    .includes("hidden")
}

function getOwnerId(project) {
  const o = project?.ownerId
  if (!o) return null
  return typeof o === "object" && o._id != null ? String(o._id) : String(o)
}

function getInvestorId(investment) {
  const inv = investment?.investorId
  if (!inv) return null
  return typeof inv === "object" && inv._id != null ? String(inv._id) : String(inv)
}

function Chip({ children, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-left text-xs font-medium transition-colors sm:text-sm",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background hover:bg-muted/80"
      )}
    >
      {children}
    </button>
  )
}

function toggleMulti(value, current, setter) {
  if (current.includes(value)) {
    setter(current.filter((item) => item !== value))
    return
  }
  setter([...current, value])
}

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params?.projectId

  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState(null)
  const [investments, setInvestments] = useState([])
  const [currentUserId, setCurrentUserId] = useState(null)
  const [userType, setUserType] = useState(null)

  const [editOpen, setEditOpen] = useState(false)
  const [investOpen, setInvestOpen] = useState(false)
  const [investing, setInvesting] = useState(false)
  const [investAmount, setInvestAmount] = useState("")
  const [investCurrency, setInvestCurrency] = useState("USD")
  const [investStage, setInvestStage] = useState(null)
  const [investVisibility, setInvestVisibility] = useState("public")
  const [investConviction, setInvestConviction] = useState("")
  const [investNotes, setInvestNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [industries, setIndustries] = useState([])
  const [stage, setStage] = useState(null)
  const [users, setUsers] = useState("")
  const [revenue, setRevenue] = useState("")
  const [tagsInput, setTagsInput] = useState("")
  const [website, setWebsite] = useState("")
  const [github, setGithub] = useState("")
  const [demo, setDemo] = useState("")
  const [visibility, setVisibility] = useState("public")

  useEffect(() => {
    if (typeof window === "undefined") return
    setCurrentUserId(localStorage.getItem("userId"))
    setUserType(localStorage.getItem("userType"))
  }, [])

  const loadProject = useCallback(async () => {
    if (!projectId) return
    setLoading(true)
    try {
      const res = await fetchPublicProject(projectId)
      if (res.type === "success" && res.project) {
        setProject(res.project)
        setInvestments(res.investments || [])
      } else {
        toast.error(res.message || "Project not found")
        setProject(null)
      }
    } catch {
      toast.error("Failed to load project")
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    loadProject()
  }, [loadProject])

  const populateEditForm = useCallback((p) => {
    setTitle(p.title || "")
    setDescription(p.description || "")
    setIndustries([...(p.industries || [])])
    setStage(p.stage || null)
    setUsers(
      p.metrics?.users != null && p.metrics.users !== ""
        ? String(p.metrics.users)
        : ""
    )
    setRevenue(
      p.metrics?.revenue != null && p.metrics.revenue !== ""
        ? String(p.metrics.revenue)
        : ""
    )
    setTagsInput((p.tags || []).join(", "))
    setWebsite(p.links?.website || "")
    setGithub(p.links?.github || "")
    setDemo(p.links?.demo || "")
    setVisibility(p.visibility === "private" ? "private" : "public")
  }, [])

  const openEdit = () => {
    if (!project) return
    populateEditForm(project)
    setEditOpen(true)
  }

  const resetInvestForm = () => {
    setInvestAmount("")
    setInvestCurrency("USD")
    setInvestStage(project?.stage || null)
    setInvestVisibility("public")
    setInvestConviction("")
    setInvestNotes("")
  }

  const openInvest = () => {
    resetInvestForm()
    setInvestOpen(true)
  }

  const handleSubmitInvestment = async () => {
    if (!projectId) return

    const amountNum =
      investAmount.trim() === "" ? undefined : Number(investAmount)
    if (amountNum !== undefined && (Number.isNaN(amountNum) || amountNum < 0)) {
      toast.error("Enter a valid amount or leave it blank.")
      return
    }

    let conviction
    if (investConviction.trim() !== "") {
      conviction = Number(investConviction)
      if (Number.isNaN(conviction) || conviction < 1 || conviction > 5) {
        toast.error("Conviction level must be between 1 and 5.")
        return
      }
    }

    setInvesting(true)
    try {
      const data = await createInvestment({
        projectId,
        amount: amountNum,
        currency: investCurrency.trim().toUpperCase() || "USD",
        stage: investStage || undefined,
        visibility: investVisibility,
        convictionLevel: conviction,
        notes: investNotes.trim() || undefined,
      })

      if (data.type === "success") {
        toast.success(data.message || "Investment recorded.")
        setInvestOpen(false)
        await loadProject()
      } else {
        toast.error(data.message || "Could not record investment.")
      }
    } catch {
      toast.error("Could not record investment.")
    } finally {
      setInvesting(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!projectId || !title.trim() || !description.trim()) {
      toast.error("Title and description are required.")
      return
    }

    setSaving(true)
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)

      const data = await updateProject(projectId, {
        title: title.trim(),
        description: description.trim(),
        industries,
        stage: stage || "",
        users: users === "" ? 0 : Number(users),
        revenue: revenue === "" ? 0 : Number(revenue),
        tags,
        website: website.trim(),
        github: github.trim(),
        demo: demo.trim(),
        visibility,
      })

      if (data.type === "success") {
        toast.success("Project updated.")
        setEditOpen(false)
        await loadProject()
      } else {
        toast.error(data.message || "Could not update project.")
      }
    } catch {
      toast.error("Could not update project.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-2xl p-8 text-center">
        <p className="text-muted-foreground">This project is not available.</p>
        <Button asChild className="mt-4">
          <Link href="/founders">Browse founders</Link>
        </Button>
      </div>
    )
  }

  const owner = project.ownerId
  const ownerIsInvestor = project.ownerType === "investor"
  const ownerHref = owner?._id
    ? ownerIsInvestor
      ? `/investors/${owner._id}`
      : `/founders/${owner._id}`
    : null
  const ownerLabel = ownerIsInvestor ? "Investor" : "Founder"

  const ownerId = getOwnerId(project)
  const isOwner =
    Boolean(currentUserId) &&
    Boolean(ownerId) &&
    String(currentUserId) === String(ownerId)

  const isInvestor = userType === "investor"
  const alreadyInvested = investments.some(
    (inv) =>
      currentUserId && getInvestorId(inv) === String(currentUserId)
  )
  const canInvest =
    isInvestor && Boolean(currentUserId) && !isOwner && !alreadyInvested

  const links = project.links || {}

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-8 pb-16">
      <div className="mx-auto max-w-3xl space-y-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>

        <div className="space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              {project.stage && (
                <Badge variant="secondary" className="text-sm">
                  {project.stage}
                </Badge>
              )}
              {isOwner && (
                <Button variant="outline" size="sm" onClick={openEdit}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Posted{" "}
            {new Date(project.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        {owner && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4" />
                {ownerLabel}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-semibold">
                  {owner.fullName || owner.username || "Owner"}
                </p>
                {owner.username && (
                  <p className="text-sm text-muted-foreground">
                    @{owner.username}
                  </p>
                )}
              </div>
              {ownerHref && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={ownerHref}>View profile</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {project.description}
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
                  {(project.metrics?.users ?? 0).toLocaleString()}
                </span>
              </p>
              <p>
                Revenue:{" "}
                <span className="font-medium">
                  {(project.metrics?.revenue ?? 0).toLocaleString()}
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Links</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {links.website && (
                <a
                  href={links.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Globe className="h-4 w-4 shrink-0" />
                  Website
                </a>
              )}
              {links.github && (
                <a
                  href={links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Github className="h-4 w-4 shrink-0" />
                  GitHub
                </a>
              )}
              {links.demo && (
                <a
                  href={links.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <PlayCircle className="h-4 w-4 shrink-0" />
                  Demo
                </a>
              )}
              {!links.website && !links.github && !links.demo && (
                <p className="text-sm text-muted-foreground">No links listed.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {(project.industries?.length > 0 || project.tags?.length > 0) && (
          <div className="space-y-2">
            {project.industries?.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                  Industries
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.industries.map((i) => (
                    <Badge key={i} variant="outline">
                      {i}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {project.tags?.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                  Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((t) => (
                    <Badge key={t} variant="secondary">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-2xl font-semibold">
              <DollarSign className="h-6 w-6" />
              Funding & rounds
            </h2>
            {canInvest && (
              <Button onClick={openInvest}>
                <TrendingUp className="mr-2 h-4 w-4" />
                Invest in project
              </Button>
            )}
            {isInvestor && alreadyInvested && !isOwner && (
              <Badge variant="secondary">You already invested in this project</Badge>
            )}
          </div>
          {investments.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              No public investment rounds recorded yet.
            </Card>
          ) : (
            <Card>
              <CardContent className="divide-y p-0">
                {investments.map((inv) => {
                  const invUser =
                    typeof inv.investorId === "object" && inv.investorId
                      ? inv.investorId
                      : null
                  const hidden = amountHidden(inv.visibility)
                  return (
                    <div
                      key={inv._id}
                      className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-medium">
                          {invUser?.fullName ||
                            invUser?.username ||
                            "Investor"}
                        </p>
                        {invUser?.username && invUser?.fullName && (
                          <p className="text-sm text-muted-foreground">
                            @{invUser.username}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {inv.stage && `Stage: ${inv.stage}`}
                          {inv.createdAt &&
                            ` · ${new Date(inv.createdAt).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        {hidden ? (
                          <span className="text-muted-foreground">
                            Amount hidden
                          </span>
                        ) : (
                          <span className="font-semibold">
                            {inv.amount != null
                              ? Number(inv.amount).toLocaleString()
                              : "—"}{" "}
                            {inv.currency || "USD"}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[min(90vh,800px)] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit project</DialogTitle>
            <DialogDescription>
              Update your project details. Changes apply immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="etitle">Title *</Label>
              <Input
                id="etitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Project name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edesc">Description *</Label>
              <Textarea
                id="edesc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What are you building?"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Industries</Label>
              <div className="flex flex-wrap gap-2">
                {INDUSTRY_OPTIONS.map((opt) => (
                  <Chip
                    key={opt}
                    selected={industries.includes(opt)}
                    onClick={() => toggleMulti(opt, industries, setIndustries)}
                  >
                    {opt}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Stage</Label>
              <div className="flex flex-wrap gap-2">
                {FUNDING_STAGE_OPTIONS.map((opt) => (
                  <Chip
                    key={opt}
                    selected={stage === opt}
                    onClick={() => setStage(stage === opt ? null : opt)}
                  >
                    {opt}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="eusers">Users (metric)</Label>
                <Input
                  id="eusers"
                  type="number"
                  min={0}
                  value={users}
                  onChange={(e) => setUsers(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="erev">Revenue (metric)</Label>
                <Input
                  id="erev"
                  type="number"
                  min={0}
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="etags">Tags</Label>
              <Input
                id="etags"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Comma-separated"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="eweb">Website</Label>
                <Input
                  id="eweb"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="egh">GitHub</Label>
                <Input
                  id="egh"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edemo">Demo</Label>
                <Input
                  id="edemo"
                  value={demo}
                  onChange={(e) => setDemo(e.target.value)}
                  placeholder="https://"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Visibility</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={visibility === "public" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setVisibility("public")}
                >
                  Public
                </Button>
                <Button
                  type="button"
                  variant={visibility === "private" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setVisibility("private")}
                >
                  Private
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveEdit} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={investOpen} onOpenChange={setInvestOpen}>
        <DialogContent className="max-h-[min(90vh,800px)] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Invest in project</DialogTitle>
            <DialogDescription>
              Record your investment in {project.title}. This will appear in funding
              rounds based on visibility.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="inv-amount">Amount (optional)</Label>
                <Input
                  id="inv-amount"
                  type="number"
                  min={0}
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                  placeholder="e.g. 50000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inv-currency">Currency</Label>
                <Input
                  id="inv-currency"
                  value={investCurrency}
                  onChange={(e) => setInvestCurrency(e.target.value)}
                  placeholder="USD"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Round stage</Label>
              <div className="flex flex-wrap gap-2">
                {FUNDING_STAGE_OPTIONS.map((opt) => (
                  <Chip
                    key={opt}
                    selected={investStage === opt}
                    onClick={() =>
                      setInvestStage(investStage === opt ? null : opt)
                    }
                  >
                    {opt}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Visibility</Label>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button
                  type="button"
                  variant={investVisibility === "public" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setInvestVisibility("public")}
                >
                  Public
                </Button>
                <Button
                  type="button"
                  variant={
                    investVisibility === "amount_hidden" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setInvestVisibility("amount_hidden")}
                >
                  Hide amount
                </Button>
                <Button
                  type="button"
                  variant={investVisibility === "private" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setInvestVisibility("private")}
                >
                  Private
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Private investments are not shown on this public project page.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inv-conviction">Conviction (1–5, optional)</Label>
              <Input
                id="inv-conviction"
                type="number"
                min={1}
                max={5}
                value={investConviction}
                onChange={(e) => setInvestConviction(e.target.value)}
                placeholder="1 = low, 5 = high"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inv-notes">Notes (optional)</Label>
              <Textarea
                id="inv-notes"
                value={investNotes}
                onChange={(e) => setInvestNotes(e.target.value)}
                placeholder="Why you're investing, terms, etc."
                className="min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setInvestOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmitInvestment}
              disabled={investing}
            >
              {investing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Submit investment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
