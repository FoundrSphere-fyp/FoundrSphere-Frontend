"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  Briefcase,
  ExternalLink,
  FolderKanban,
  Loader2,
  Lock,
  Plus,
  Globe,
} from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"
import { fetchAccountSettings } from "@/lib/account-settings-api"
import { fetchMyProjects, createProject } from "@/lib/projects-api"
import {
  INDUSTRY_OPTIONS,
  FUNDING_STAGE_OPTIONS,
} from "@/lib/select-options"

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

function InfoRow({ label, value }) {
  if (value === undefined || value === null || value === "") return null
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
      <span className="min-w-[140px] text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <span className="text-sm">{value}</span>
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [projects, setProjects] = useState([])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [savingProject, setSavingProject] = useState(false)
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

  const load = useCallback(async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) {
      router.replace("/login")
      return
    }

    setLoading(true)
    try {
      const [acc, proj] = await Promise.all([
        fetchAccountSettings(),
        fetchMyProjects(),
      ])

      if (acc.type !== "success" || !acc.user) {
        toast.error(acc.message || "Could not load profile.")
        router.push("/dashboard")
        return
      }

      setUser(acc.user)
      setProfile(acc.profile || null)

      if (proj.type === "success") {
        setProjects(proj.projects || [])
      } else {
        toast.error(proj.message || "Could not load projects.")
        setProjects([])
      }
    } catch {
      toast.error("Failed to load profile.")
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    load()
  }, [load])

  const resetProjectForm = () => {
    setTitle("")
    setDescription("")
    setIndustries([])
    setStage(null)
    setUsers("")
    setRevenue("")
    setTagsInput("")
    setWebsite("")
    setGithub("")
    setDemo("")
    setVisibility("public")
  }

  const handleCreateProject = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required.")
      return
    }

    setSavingProject(true)
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)

      const data = await createProject({
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

      if (data.type === "success" && data.project) {
        toast.success("Project created.")
        setProjects((prev) => [data.project, ...prev])
        setDialogOpen(false)
        resetProjectForm()
      } else {
        toast.error(data.message || "Could not create project.")
      }
    } catch {
      toast.error("Could not create project.")
    } finally {
      setSavingProject(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-gradient-to-br from-background to-muted p-8">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) return null

  const role = user.userType
  const initial = (user.fullName || user.username || "?")
    .charAt(0)
    .toUpperCase()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 pb-16 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard" aria-label="Back">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My profile</h1>
              <p className="text-muted-foreground">
                Your account, preferences, and projects.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/account-settings">Edit account settings</Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row flex-wrap items-start gap-4 space-y-0">
            <Avatar className="h-20 w-20 border">
              {user.avatar ? (
                <AvatarImage src={user.avatar} alt="" />
              ) : null}
              <AvatarFallback className="text-2xl font-semibold">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-2xl">
                  {user.fullName || "Your name"}
                </CardTitle>
                {role && (
                  <Badge variant="secondary" className="capitalize">
                    <Briefcase className="mr-1 h-3 w-3" />
                    {role}
                  </Badge>
                )}
              </div>
              <CardDescription className="text-base">
                @{user.username} · {user.email}
              </CardDescription>
              {user.bio && (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {user.bio}
                </p>
              )}
            </div>
          </CardHeader>
        </Card>

        {role === "founder" && !profile && (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>Startup profile</CardTitle>
              <CardDescription>
                You haven&apos;t added founder details yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" asChild>
                <Link href="/account-settings">Complete in account settings</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {role === "founder" && profile && (
          <Card>
            <CardHeader>
              <CardTitle>Startup profile</CardTitle>
              <CardDescription>
                Visible to investors and used for recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Startup" value={profile.startupName} />
              <InfoRow label="Description" value={profile.description} />
              {profile.industries?.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Industries
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.industries.map((i) => (
                      <Badge key={i} variant="outline">
                        {i}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <InfoRow label="Stage" value={profile.stage} />
              <InfoRow
                label="Funding needed"
                value={
                  profile.fundingNeeded != null
                    ? Number(profile.fundingNeeded).toLocaleString()
                    : ""
                }
              />
              <InfoRow label="Location" value={profile.location} />
              <InfoRow label="Business model" value={profile.businessModel} />
              <InfoRow label="Founder role" value={profile.founderRole} />
              <InfoRow label="Commitment" value={profile.commitmentLevel} />
              {profile.desiredCofounderRoles?.length > 0 && (
                <InfoRow
                  label="Desired co-founder roles"
                  value={profile.desiredCofounderRoles.join(", ")}
                />
              )}
              <InfoRow
                label="Desired co-founder commitment"
                value={profile.desiredCommitmentLevel}
              />
              <InfoRow
                label="Co-founder preference"
                value={profile.cofounderPreferenceText}
              />
              {(profile.traction?.users != null ||
                profile.traction?.revenue != null) && (
                <InfoRow
                  label="Traction"
                  value={`Users: ${profile.traction?.users ?? "—"} · Revenue: ${profile.traction?.revenue ?? "—"}`}
                />
              )}
            </CardContent>
          </Card>
        )}

        {role === "investor" && !profile && (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>Investment profile</CardTitle>
              <CardDescription>
                You haven&apos;t added investor preferences yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" asChild>
                <Link href="/account-settings">Complete in account settings</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {role === "investor" && profile && (
          <Card>
            <CardHeader>
              <CardTitle>Investment profile</CardTitle>
              <CardDescription>
                Used to match you with relevant founders.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Firm" value={profile.firmName} />
              <InfoRow label="Type" value={profile.investorType} />
              {profile.preferredIndustries?.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Preferred industries
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.preferredIndustries.map((i) => (
                      <Badge key={i} variant="outline">
                        {i}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {profile.preferredStages?.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Preferred stages
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.preferredStages.map((s) => (
                      <Badge key={s} variant="secondary">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <InfoRow
                label="Check size"
                value={
                  profile.checkSizeMin != null || profile.checkSizeMax != null
                    ? `${profile.checkSizeMin ?? "—"} – ${profile.checkSizeMax ?? "—"}`
                    : ""
                }
              />
              {profile.locations?.length > 0 && (
                <InfoRow
                  label="Locations"
                  value={profile.locations.join(", ")}
                />
              )}
              <InfoRow label="Thesis" value={profile.investmentThesis} />
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                My projects
              </h2>
              <p className="text-sm text-muted-foreground">
                {projects.length} project{projects.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Button onClick={() => { resetProjectForm(); setDialogOpen(true) }}>
              <Plus className="mr-2 h-4 w-4" />
              New project
            </Button>
          </div>

          {projects.length === 0 ? (
            <Card className="border-dashed p-10 text-center">
              <FolderKanban className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
              <p className="mb-4 text-muted-foreground">
                You don&apos;t have any projects yet. Create one to showcase your
                work.
              </p>
              <Button
                onClick={() => {
                  resetProjectForm()
                  setDialogOpen(true)
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add project
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {projects.map((p) => (
                <Card key={p._id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="line-clamp-2 text-lg">
                        {p.title}
                      </CardTitle>
                      <div className="flex shrink-0 flex-wrap justify-end gap-1">
                        {p.stage && (
                          <Badge variant="secondary">{p.stage}</Badge>
                        )}
                        {p.visibility === "private" ? (
                          <Badge variant="outline" className="gap-0.5">
                            <Lock className="h-3 w-3" />
                            Private
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-0.5">
                            <Globe className="h-3 w-3" />
                            Public
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {p.description && (
                      <p className="line-clamp-3 text-sm text-muted-foreground">
                        {p.description}
                      </p>
                    )}
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href={`/projects/${p._id}`}>
                        View details
                        <ExternalLink className="ml-2 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[min(90vh,800px)] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>New project</DialogTitle>
            <DialogDescription>
              Add a startup or initiative. You can set visibility to private or
              public.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="ptitle">Title *</Label>
              <Input
                id="ptitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Project name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pdesc">Description *</Label>
              <Textarea
                id="pdesc"
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
                <Label htmlFor="pusers">Users (metric)</Label>
                <Input
                  id="pusers"
                  type="number"
                  min={0}
                  value={users}
                  onChange={(e) => setUsers(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prev">Revenue (metric)</Label>
                <Input
                  id="prev"
                  type="number"
                  min={0}
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ptags">Tags</Label>
              <Input
                id="ptags"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Comma-separated, e.g. AI, B2B"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="pweb">Website</Label>
                <Input
                  id="pweb"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pgh">GitHub</Label>
                <Input
                  id="pgh"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pdemo">Demo</Label>
                <Input
                  id="pdemo"
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
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateProject}
              disabled={savingProject}
            >
              {savingProject ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Create project"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
