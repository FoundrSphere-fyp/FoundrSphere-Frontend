"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Users, Brain, DollarSign, MessageCircle } from "lucide-react"
import Link from "next/link"
import { useUserStore } from "@/store/store"

export default function Dashboard() {
  const user = { name: "Hussnain" }
  const {username} = useUserStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {username} 👋</h1>
            <p className="text-muted-foreground">
              Here’s a quick look at your FoundrSphere journey today.
            </p>
          </div>
          <Button asChild>
            <Link href="/idea-evaluator">
              <Plus className="w-4 h-4 mr-2" /> Submit New Idea
            </Link>
          </Button>
        </div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card className="shadow-sm hover:shadow-lg transition">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Users className="w-5 h-5 text-primary" /> Co-founder Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">Active connections</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-lg transition">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Brain className="w-5 h-5 text-primary" /> Idea Evaluations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">5</p>
              <p className="text-sm text-muted-foreground">Evaluated by AI</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-lg transition">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <DollarSign className="w-5 h-5 text-primary" /> Investors Reached
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">3</p>
              <p className="text-sm text-muted-foreground">Pending responses</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-lg transition">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <MessageCircle className="w-5 h-5 text-primary" /> Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">9</p>
              <p className="text-sm text-muted-foreground">Unread messages</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions / Shortcuts */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card className="group cursor-pointer hover:bg-muted transition">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Find Co-Founder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground text-sm">
                Discover potential co-founders with complementary skills and aligned goals.
              </p>
              <Button variant="outline" asChild>
                <Link href="/cofounders">Explore Matches</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group cursor-pointer hover:bg-muted transition">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Connect with Investors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground text-sm">
                Browse recommended investors based on your startup profile and industry.
              </p>
              <Button variant="outline" asChild>
                <Link href="/investors">View Investors</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group cursor-pointer hover:bg-muted transition">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Join Community</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground text-sm">
                Collaborate with fellow founders, mentors, and industry experts.
              </p>
              <Button variant="outline" asChild>
                <Link href="/community">Join Now</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 text-sm text-muted-foreground">
                ✅ Your idea *“AI-Based Investor Matcher”* was evaluated. Market Fit Score: **89%**.
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
