"use client"

import * as React from "react"
import toast from "react-hot-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  INDUSTRY_OPTIONS,
  FUNDING_STAGE_OPTIONS,
  BUSINESS_MODEL_OPTIONS,
  INVESTOR_TYPE_OPTIONS,
} from "@/constants/select-options"

function ChipToggle({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-muted/50 text-foreground hover:bg-muted"
      )}
    >
      {children}
    </button>
  )
}

function toggleInList(value, list, setList) {
  if (list.includes(value)) {
    setList(list.filter((x) => x !== value))
  } else {
    setList([...list, value])
  }
}

export default function OnboardingModal({ open, userType, onComplete }) {
  const [loading, setLoading] = React.useState(false)

  // Founder
  const [startupName, setStartupName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [founderIndustries, setFounderIndustries] = React.useState([])
  const [founderStage, setFounderStage] = React.useState("")
  const [businessModel, setBusinessModel] = React.useState("")
  const [fundingNeeded, setFundingNeeded] = React.useState("")
  const [location, setLocation] = React.useState("")
  const [tractionUsers, setTractionUsers] = React.useState("")
  const [tractionRevenue, setTractionRevenue] = React.useState("")

  // Investor
  const [firmName, setFirmName] = React.useState("")
  const [investorType, setInvestorType] = React.useState("")
  const [preferredIndustries, setPreferredIndustries] = React.useState([])
  const [preferredStages, setPreferredStages] = React.useState([])
  const [checkSizeMin, setCheckSizeMin] = React.useState("")
  const [checkSizeMax, setCheckSizeMax] = React.useState("")
  const [locations, setLocations] = React.useState("")
  const [investmentThesis, setInvestmentThesis] = React.useState("")

  const submit = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) {
      toast.error("Session expired. Please log in again.")
      return
    }

    if (userType === "founder") {
      if (!startupName.trim() || !description.trim()) {
        toast.error("Startup name and description are required.")
        return
      }
    } else if (userType === "investor") {
      if (!firmName.trim() || !investorType.trim()) {
        toast.error("Firm name and investor type are required.")
        return
      }
    } else {
      return
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL
    const payload =
      userType === "founder"
        ? {
            startupName,
            description,
            industries: founderIndustries,
            stage: founderStage,
            fundingNeeded,
            location,
            businessModel,
            tractionUsers,
            tractionRevenue,
          }
        : {
            firmName,
            investorType,
            preferredIndustries,
            preferredStages,
            checkSizeMin,
            checkSizeMax,
            locations,
            investmentThesis,
          }

    setLoading(true)
    try {
      const res = await fetch(`${baseUrl}/auth/onboarding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.type === "success") {
        toast.success(data.message || "Profile completed!")
        if (data.user) {
          localStorage.setItem("isProfileComplete", String(data.user.isProfileComplete))
        } else {
          localStorage.setItem("isProfileComplete", "true")
        }
        onComplete?.(data.user)
      } else {
        toast.error(data.message || "Could not save profile.")
      }
    } catch (e) {
      toast.error("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  const title =
    userType === "founder"
      ? "Complete your founder profile"
      : userType === "investor"
        ? "Complete your investor profile"
        : "Complete your profile"

  const subtitle =
    userType === "founder"
      ? "Tell us about your startup to unlock the full dashboard."
      : userType === "investor"
        ? "Share your investment focus so we can match you with founders."
        : ""

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{subtitle}</DialogDescription>
        </DialogHeader>

        {userType === "founder" && (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="startupName">Startup name *</Label>
              <Input
                id="startupName"
                value={startupName}
                onChange={(e) => setStartupName(e.target.value)}
                placeholder="Your company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does your startup do?"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Industries</Label>
              <div className="flex flex-wrap gap-2">
                {INDUSTRY_OPTIONS.map((opt) => (
                  <ChipToggle
                    key={opt}
                    active={founderIndustries.includes(opt)}
                    onClick={() => toggleInList(opt, founderIndustries, setFounderIndustries)}
                  >
                    {opt}
                  </ChipToggle>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Stage</Label>
              <div className="flex flex-wrap gap-2">
                {FUNDING_STAGE_OPTIONS.map((opt) => (
                  <ChipToggle
                    key={opt}
                    active={founderStage === opt}
                    onClick={() => setFounderStage(founderStage === opt ? "" : opt)}
                  >
                    {opt}
                  </ChipToggle>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Business model</Label>
              <div className="flex flex-wrap gap-2">
                {BUSINESS_MODEL_OPTIONS.map((opt) => (
                  <ChipToggle
                    key={opt}
                    active={businessModel === opt}
                    onClick={() => setBusinessModel(businessModel === opt ? "" : opt)}
                  >
                    {opt}
                  </ChipToggle>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fundingNeeded">Funding needed (amount)</Label>
                <Input
                  id="fundingNeeded"
                  type="number"
                  min={0}
                  value={fundingNeeded}
                  onChange={(e) => setFundingNeeded(e.target.value)}
                  placeholder="e.g. 500000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, country"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tractionUsers">Traction — users</Label>
                <Input
                  id="tractionUsers"
                  type="number"
                  min={0}
                  value={tractionUsers}
                  onChange={(e) => setTractionUsers(e.target.value)}
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
                />
              </div>
            </div>
          </div>
        )}

        {userType === "investor" && (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="firmName">Firm name *</Label>
              <Input
                id="firmName"
                value={firmName}
                onChange={(e) => setFirmName(e.target.value)}
                placeholder="Fund or firm name"
              />
            </div>
            <div className="space-y-2">
              <Label>Investor type *</Label>
              <div className="flex flex-wrap gap-2">
                {INVESTOR_TYPE_OPTIONS.map((opt) => (
                  <ChipToggle
                    key={opt}
                    active={investorType === opt}
                    onClick={() => setInvestorType(investorType === opt ? "" : opt)}
                  >
                    {opt}
                  </ChipToggle>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Preferred industries</Label>
              <div className="flex flex-wrap gap-2">
                {INDUSTRY_OPTIONS.map((opt) => (
                  <ChipToggle
                    key={opt}
                    active={preferredIndustries.includes(opt)}
                    onClick={() =>
                      toggleInList(opt, preferredIndustries, setPreferredIndustries)
                    }
                  >
                    {opt}
                  </ChipToggle>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Preferred stages</Label>
              <div className="flex flex-wrap gap-2">
                {FUNDING_STAGE_OPTIONS.map((opt) => (
                  <ChipToggle
                    key={opt}
                    active={preferredStages.includes(opt)}
                    onClick={() => toggleInList(opt, preferredStages, setPreferredStages)}
                  >
                    {opt}
                  </ChipToggle>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="checkSizeMin">Check size min</Label>
                <Input
                  id="checkSizeMin"
                  type="number"
                  min={0}
                  value={checkSizeMin}
                  onChange={(e) => setCheckSizeMin(e.target.value)}
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
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="locations">Locations (comma-separated)</Label>
              <Input
                id="locations"
                value={locations}
                onChange={(e) => setLocations(e.target.value)}
                placeholder="e.g. Dubai, Singapore"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="investmentThesis">Investment thesis</Label>
              <Textarea
                id="investmentThesis"
                value={investmentThesis}
                onChange={(e) => setInvestmentThesis(e.target.value)}
                rows={3}
                placeholder="What do you look for in startups?"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" onClick={submit} disabled={loading}>
            {loading ? "Saving…" : "Save and continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
