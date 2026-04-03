"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Users, Brain, DollarSign, MessageCircle } from "lucide-react"
import Link from "next/link"
import { useUserStore } from "@/store/store"
import OnboardingModal from "@/components/OnboardingModal"

export default function Dashboard() {
  const username = useUserStore((s) => s.username)
  const fullName = useUserStore((s) => s.fullName)
  const userType = useUserStore((s) => s.userType)
  const SetIsProfileComplete = useUserStore((s) => s.SetIsProfileComplete)
  const SetUserType = useUserStore((s) => s.SetUserType)

  const [showOnboarding, setShowOnboarding] = React.useState(false)
  const [modalRole, setModalRole] = React.useState(null)

  React.useEffect(() => {
    const storedComplete = localStorage.getItem("isProfileComplete") === "true"
    const storedType = localStorage.getItem("userType") || ""
    if (storedType) SetUserType(storedType)
    if (
      !storedComplete &&
      (storedType === "founder" || storedType === "investor")
    ) {
      setModalRole(storedType)
      setShowOnboarding(true)
    }
  }, [SetUserType])

  const handleOnboardingComplete = (user) => {
    SetIsProfileComplete(true)
    if (user?.isProfileComplete !== undefined) {
      SetIsProfileComplete(Boolean(user.isProfileComplete))
    }
    localStorage.setItem("isProfileComplete", "true")
    setShowOnboarding(false)
  }

  const displayName = fullName?.trim() || username || "there"

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-8">
      <OnboardingModal
        open={showOnboarding}
        userType={modalRole || userType}
        onComplete={handleOnboardingComplete}
      />

      <div className="mx-auto max-w-7xl space-y-10">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {displayName} 👋
            </h1>
            <p className="text-muted-foreground">
              Here’s a quick look at your FoundrSphere journey today.
            </p>
          </div>
          <Button asChild>
            <Link href="/idea-evaluator">
              <Plus className="mr-2 h-4 w-4" /> Submit New Idea
            </Link>
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          <Card className="shadow-sm transition hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Users className="h-5 w-5 text-primary" /> Co-founder Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">Active connections</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm transition hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Brain className="h-5 w-5 text-primary" /> Idea Evaluations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">5</p>
              <p className="text-sm text-muted-foreground">Evaluated by AI</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm transition hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <DollarSign className="h-5 w-5 text-primary" /> Investors Reached
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">3</p>
              <p className="text-sm text-muted-foreground">Pending responses</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm transition hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <MessageCircle className="h-5 w-5 text-primary" /> Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">9</p>
              <p className="text-sm text-muted-foreground">Unread messages</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          <Card className="group cursor-pointer transition hover:bg-muted">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Find Co-Founder
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Discover potential co-founders with complementary skills and
                aligned goals.
              </p>
              <Button variant="outline" asChild>
                <Link href="/cofounders">Explore Matches</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group cursor-pointer transition hover:bg-muted">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Connect with Investors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Browse recommended investors based on your startup profile and
                industry.
              </p>
              <Button variant="outline" asChild>
                <Link href="/investors">View Investors</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group cursor-pointer transition hover:bg-muted">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Join Community
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Collaborate with fellow founders, mentors, and industry experts.
              </p>
              <Button variant="outline" asChild>
                <Link href="/community">Join Now</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <div className="mt-10">
          <h2 className="mb-4 text-2xl font-semibold">Recent Activity</h2>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 text-sm text-muted-foreground">
                ✅ Your idea *“AI-Based Investor Matcher”* was evaluated.
                Market Fit Score: **89%**.
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-sm text-muted-foreground">
                💬 You received a new message from *Mahnoor (Co-Founder)*.
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-sm text-muted-foreground">
                🚀 Your startup profile reached 3 new investors this week.
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
