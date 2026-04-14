"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MessageCircle,
  Mail,
  MapPin,
  Briefcase,
  Users,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import RecommendationsPanel from "@/components/RecommendationsPanel"
import BrowseRecommendedToggle from "@/components/BrowseRecommendedToggle"

export default function FoundersPage() {
  const [founders, setFounders] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingConversation, setLoadingConversation] = useState(null)
  const [userType, setUserType] = useState("")
  const [view, setView] = useState("all")
  const router = useRouter()
  const currentUserId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null

  const showRecSwitch = userType === "investor" || userType === "founder"
  const recommendationMode = userType === "founder" ? "cofounders" : "founders"
  const recommendationLabel =
    userType === "founder" ? "Recommended co-founders" : "Suggested startups"

  useEffect(() => {
    setUserType(localStorage.getItem("userType") || "")
  }, [])

  useEffect(() => {
    fetchFounders()
  }, [])

  const fetchFounders = async () => {
    try {
      setLoading(true)
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/founders/get-founders`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      const data = await res.json()

      if (data.type === "success") {
        const filteredFounders = data.founders.filter(
          (founder) => founder._id !== currentUserId
        )
        setFounders(filteredFounders)
      } else {
        toast.error(data.message || "Failed to load founders")
      }
    } catch (error) {
      console.error("Failed to fetch founders:", error)
      toast.error("Failed to load founders")
    } finally {
      setLoading(false)
    }
  }

  const startConversation = async (founderId) => {
    try {
      setLoadingConversation(founderId)
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/messages/get-or-create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ receiverId: founderId }),
        }
      )

      const data = await res.json()
      if (data.type === "success") {
        router.push(`/chat/${data.conversation._id}`)
      } else {
        toast.error(data.message || "Failed to start conversation")
      }
    } catch (error) {
      console.error("Failed to start conversation:", error)
      toast.error("Failed to start conversation")
    } finally {
      setLoadingConversation(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex h-[60vh] items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading founders...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-8 pb-16">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Discover Founders 🚀
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Connect with fellow entrepreneurs, share ideas, and build the future
            together.
          </p>
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{founders.length} founders in the community</span>
            </div>
            {showRecSwitch && (
              <BrowseRecommendedToggle
                value={view}
                onChange={setView}
                allLabel="All founders"
                recLabel={recommendationLabel}
              />
            )}
          </div>
        </div>

        {showRecSwitch && view === "recommended" ? (
          <RecommendationsPanel mode={recommendationMode} active />
        ) : founders.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <Users className="mx-auto h-16 w-16 text-muted-foreground" />
              <div>
                <h3 className="mb-2 text-lg font-semibold">No founders yet</h3>
                <p className="text-muted-foreground">
                  Be the first to join the community!
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {founders.map((founder) => (
              <Card
                key={founder._id}
                className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <CardHeader className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-2xl font-bold text-white">
                      {founder.fullName?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="mb-1 text-xl">
                        {founder.fullName || "Unknown"}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        @{founder.username}
                      </p>
                    </div>
                  </div>

                  <Badge variant="secondary" className="w-fit">
                    <Briefcase className="mr-1 h-3 w-3" />
                    Founder
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-4">
                  {founder.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{founder.email}</span>
                    </div>
                  )}

                  {founder.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{founder.location}</span>
                    </div>
                  )}

                  {founder.bio && (
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {founder.bio}
                    </p>
                  )}

                  <div className="border-t pt-2 text-xs text-muted-foreground">
                    Joined{" "}
                    {new Date(founder.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button variant="outline" className="flex-1" asChild>
                      <Link href={`/founders/${founder._id}`}>View profile</Link>
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => startConversation(founder._id)}
                      disabled={loadingConversation === founder._id}
                    >
                      {loadingConversation === founder._id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Starting chat...
                        </>
                      ) : (
                        <>
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Message
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
