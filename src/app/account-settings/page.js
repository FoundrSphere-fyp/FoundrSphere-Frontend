"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  Loader2,
  Save,
} from "lucide-react"
import toast from "react-hot-toast"
import { useUserStore } from "@/store/store"
import { cn } from "@/lib/utils"
import {
  fetchAccountSettings,
  updateAccountSettings,
} from "@/lib/account-settings-api"
import {
  INDUSTRY_OPTIONS,
  FUNDING_STAGE_OPTIONS,
  INVESTOR_TYPES,
  BUSINESS_MODELS,
} from "@/lib/select-options"

function toggleMulti(value, current, setter) {
  if (current.includes(value)) {
    setter(current.filter((item) => item !== value))
    return
  }
  setter([...current, value])
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

export default function AccountSettingsPage() {
  const router = useRouter()
  const {
    SetUsername,
    SetFullName,
    SetEmail,
    SetUserType,
    SetIsProfileComplete,
  } = useUserStore()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("user")
  const [role, setRole] = useState(null)

  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [bio, setBio] = useState("")
  const [avatar, setAvatar] = useState("")

  const [startupName, setStartupName] = useState("")
  const [description, setDescription] = useState("")
  const [founderIndustries, setFounderIndustries] = useState([])
  const [founderStage, setFounderStage] = useState(null)
  const [fundingNeeded, setFundingNeeded] = useState("")
  const [location, setLocation] = useState("")
  const [businessModel, setBusinessModel] = useState(null)
  const [tractionUsers, setTractionUsers] = useState("")
  const [tractionRevenue, setTractionRevenue] = useState("")

  const [firmName, setFirmName] = useState("")
  const [investorType, setInvestorType] = useState(null)
  const [preferredIndustries, setPreferredIndustries] = useState([])
  const [preferredStages, setPreferredStages] = useState([])
  const [checkSizeMin, setCheckSizeMin] = useState("")
  const [checkSizeMax, setCheckSizeMax] = useState("")
  const [locations, setLocations] = useState("")
  const [investmentThesis, setInvestmentThesis] = useState("")

  const loadData = useCallback(async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) {
      router.replace("/login")
      return
    }

    setLoading(true)
    try {
      const data = await fetchAccountSettings()
      if (data.type !== "success" || !data.user) {
        toast.error(data.message || "Failed to load account settings.")
        router.push("/dashboard")
        return
      }

      const user = data.user
      const profile = data.profile || {}

      setRole(user.userType || null)
      setFullName(user.fullName || "")
      setUsername(user.username || "")
      setEmail(user.email || "")
      setBio(user.bio || "")
      setAvatar(user.avatar || "")

      if (user.userType === "founder") {
        setStartupName(profile.startupName || "")
        setDescription(profile.description || "")
        setFounderIndustries(profile.industries || [])
        setFounderStage(profile.stage || null)
        setFundingNeeded(
          profile.fundingNeeded != null ? String(profile.fundingNeeded) : ""
        )
        setLocation(profile.location || "")
        setBusinessModel(profile.businessModel || null)
        setTractionUsers(
          profile?.traction?.users != null ? String(profile.traction.users) : ""
        )
        setTractionRevenue(
          profile?.traction?.revenue != null
            ? String(profile.traction.revenue)
            : ""
        )
      } else if (user.userType === "investor") {
        setFirmName(profile.firmName || "")
        setInvestorType(profile.investorType || null)
        setPreferredIndustries(profile.preferredIndustries || [])
        setPreferredStages(profile.preferredStages || [])
        setCheckSizeMin(
          profile.checkSizeMin != null ? String(profile.checkSizeMin) : ""
        )
        setCheckSizeMax(
          profile.checkSizeMax != null ? String(profile.checkSizeMax) : ""
        )
        setLocations(
          Array.isArray(profile.locations)
            ? profile.locations.join(", ")
            : profile.locations || ""
        )
        setInvestmentThesis(profile.investmentThesis || "")
      }
    } catch {
      toast.error("Something went wrong while loading settings.")
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSave = async () => {
    if (!username.trim() || !email.trim()) {
      toast.error("Username and email are required.")
      return
    }

    setSaving(true)
    try {
      const payload =
        role === "founder"
          ? {
              user: { fullName, username, email, bio, avatar },
              profile: {
                startupName,
                description,
                industries: founderIndustries,
                stage: founderStage || "",
                fundingNeeded,
                location,
                businessModel: businessModel || "",
                tractionUsers,
                tractionRevenue,
              },
            }
          : {
              user: { fullName, username, email, bio, avatar },
              profile: {
                firmName,
                investorType: investorType || "",
                preferredIndustries,
                preferredStages,
                checkSizeMin,
                checkSizeMax,
                locations,
                investmentThesis,
              },
            }

      const data = await updateAccountSettings(payload)
      if (data.type === "success") {
        toast.success("Account settings updated.")
        if (data.user) {
          SetUsername(data.user.username || "")
          SetFullName(data.user.fullName || "")
          SetEmail(data.user.email || "")
          SetUserType(data.user.userType || "")
          SetIsProfileComplete(Boolean(data.user.isProfileComplete))
          localStorage.setItem(
            "isProfileComplete",
            String(Boolean(data.user.isProfileComplete))
          )
          if (data.user.userType) {
            localStorage.setItem("userType", data.user.userType)
          }
        }
      } else {
        toast.error(data.message || "Failed to update settings.")
      }
    } catch {
      toast.error("Something went wrong while saving.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-gradient-to-br from-background to-muted p-8">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading settings…</p>
        </div>
      </div>
    )
  }

  const roleTabLabel =
    role === "founder"
      ? "Founder settings"
      : role === "investor"
        ? "Investor settings"
        : "Preferences"

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 pb-16 sm:p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard" aria-label="Back">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Account settings</h1>
            <p className="text-muted-foreground">
              Update your profile and preferences.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={activeTab === "user" ? "default" : "outline"}
            size="sm"
            className="rounded-lg"
            onClick={() => setActiveTab("user")}
          >
            Profile
          </Button>
          {role && (
            <Button
              type="button"
              variant={activeTab === "preferences" ? "default" : "outline"}
              size="sm"
              className="rounded-lg"
              onClick={() => setActiveTab("preferences")}
            >
              {roleTabLabel}
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === "user" ? "Basic info" : roleTabLabel}
            </CardTitle>
            <CardDescription>
              {activeTab === "user"
                ? "Name, username, email, and bio are stored on your user account."
                : role === "founder"
                  ? "Startup and fundraising details for matching."
                  : "Investment focus and check size for founder matching."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {activeTab === "user" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    autoCapitalize="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    autoCapitalize="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself"
                    className="min-h-[100px] resize-y"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input
                    id="avatar"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://..."
                    autoCapitalize="off"
                  />
                </div>
              </>
            )}

            {activeTab === "preferences" && role === "founder" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="startupName">Startup name</Label>
                  <Input
                    id="startupName"
                    value={startupName}
                    onChange={(e) => setStartupName(e.target.value)}
                    placeholder="Startup name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What are you building?"
                    className="min-h-[120px] resize-y"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Industries</Label>
                  <div className="flex flex-wrap gap-2">
                    {INDUSTRY_OPTIONS.map((option) => (
                      <Chip
                        key={option}
                        selected={founderIndustries.includes(option)}
                        onClick={() =>
                          toggleMulti(
                            option,
                            founderIndustries,
                            setFounderIndustries
                          )
                        }
                      >
                        {option}
                      </Chip>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Funding stage</Label>
                  <div className="flex flex-wrap gap-2">
                    {FUNDING_STAGE_OPTIONS.map((option) => (
                      <Chip
                        key={option}
                        selected={founderStage === option}
                        onClick={() =>
                          setFounderStage(founderStage === option ? null : option)
                        }
                      >
                        {option}
                      </Chip>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fundingNeeded">Funding needed</Label>
                  <Input
                    id="fundingNeeded"
                    type="number"
                    min={0}
                    value={fundingNeeded}
                    onChange={(e) => setFundingNeeded(e.target.value)}
                    placeholder="50000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, Country"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Business model</Label>
                  <div className="flex flex-wrap gap-2">
                    {BUSINESS_MODELS.map((option) => (
                      <Chip
                        key={option}
                        selected={businessModel === option}
                        onClick={() =>
                          setBusinessModel(
                            businessModel === option ? null : option
                          )
                        }
                      >
                        {option}
                      </Chip>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tractionUsers">Traction — users</Label>
                    <Input
                      id="tractionUsers"
                      type="number"
                      min={0}
                      value={tractionUsers}
                      onChange={(e) => setTractionUsers(e.target.value)}
                      placeholder="1000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tractionRevenue">Traction — revenue</Label>
                    <Input
                      id="tractionRevenue"
                      type="number"
                      min={0}
                      value={tractionRevenue}
                      onChange={(e) => setTractionRevenue(e.target.value)}
                      placeholder="20000"
                    />
                  </div>
                </div>
              </>
            )}

            {activeTab === "preferences" && role === "investor" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="firmName">Firm name</Label>
                  <Input
                    id="firmName"
                    value={firmName}
                    onChange={(e) => setFirmName(e.target.value)}
                    placeholder="Firm name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Investor type</Label>
                  <div className="flex flex-wrap gap-2">
                    {INVESTOR_TYPES.map((option) => (
                      <Chip
                        key={option}
                        selected={investorType === option}
                        onClick={() =>
                          setInvestorType(
                            investorType === option ? null : option
                          )
                        }
                      >
                        {option}
                      </Chip>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Preferred industries</Label>
                  <div className="flex flex-wrap gap-2">
                    {INDUSTRY_OPTIONS.map((option) => (
                      <Chip
                        key={option}
                        selected={preferredIndustries.includes(option)}
                        onClick={() =>
                          toggleMulti(
                            option,
                            preferredIndustries,
                            setPreferredIndustries
                          )
                        }
                      >
                        {option}
                      </Chip>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Preferred stages</Label>
                  <div className="flex flex-wrap gap-2">
                    {FUNDING_STAGE_OPTIONS.map((option) => (
                      <Chip
                        key={option}
                        selected={preferredStages.includes(option)}
                        onClick={() =>
                          toggleMulti(
                            option,
                            preferredStages,
                            setPreferredStages
                          )
                        }
                      >
                        {option}
                      </Chip>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="checkSizeMin">Check size min</Label>
                    <Input
                      id="checkSizeMin"
                      type="number"
                      min={0}
                      value={checkSizeMin}
                      onChange={(e) => setCheckSizeMin(e.target.value)}
                      placeholder="10000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkSizeMax">Check size max</Label>
                    <Input
                      id="checkSizeMax"
                      type="number"
                      min={0}
                      value={checkSizeMax}
                      onChange={(e) => setCheckSizeMax(e.target.value)}
                      placeholder="250000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="locations">Locations</Label>
                  <Input
                    id="locations"
                    value={locations}
                    onChange={(e) => setLocations(e.target.value)}
                    placeholder="Comma-separated, e.g. SF, NYC"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="investmentThesis">Investment thesis</Label>
                  <Textarea
                    id="investmentThesis"
                    value={investmentThesis}
                    onChange={(e) => setInvestmentThesis(e.target.value)}
                    placeholder="What do you look for in startups?"
                    className="min-h-[120px] resize-y"
                  />
                </div>
              </>
            )}

            {activeTab === "preferences" && !role && (
              <p className="text-sm text-muted-foreground">
                Complete onboarding to unlock founder or investor preferences.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <Button variant="outline" asChild>
            <Link href="/dashboard">Cancel</Link>
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
