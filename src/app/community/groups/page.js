"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Plus, Lock, Globe, Users } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import toast from "react-hot-toast"
import { useUserStore } from "@/store/store"

export default function GroupsPage() {
  const {userId} = useUserStore();
  const [groups, setGroups] = useState([
    {
      name: "AI Founders Network",
      description: "A space for founders building AI-driven startups.",
      visibility: "Public",
      topic: "Artificial Intelligence",
      icon: "🤖",
    },
    {
      name: "SaaS Innovators",
      description: "Discuss SaaS products, business models, and scaling strategies.",
      visibility: "Public",
      topic: "SaaS",
      icon: "💡",
    },
  ])

  const getGroups = async() => {
     const req = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups/get-groups`)
    const res = await req.json();

    if (res.type == "success") {
      setGroups(res.groups);
      console.log(res.groups)
      // toast.success(res.message);
    }
    else {
      toast.error(res.message);
    }
  } 

  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    visibility: "Public",
    topic: "",
    icon: "",
  })

  const handleCreateGroup = async() => {
    if (!newGroup.name || !newGroup.description) return
    const req = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups/add-group`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({     
        ...newGroup
      }),
    });
    const res = await req.json();
    if (res.type == "success") {
      setGroups([...groups, newGroup])
      setNewGroup({ name: "", description: "", visibility: "Public", topic: "", icon: "" });
    }
    else {
      toast.error(res.message);
    }
  }

  useEffect(() => {
    getGroups();
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Founder Groups 👥</h1>
            <p className="text-muted-foreground">
              Discover, join, and create communities around your startup interests.
            </p>
          </div>

          {/* Create Group Modal */}
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" /> Create New Group
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create a New Group</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Group Name</Label>
                  <Input
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    placeholder="e.g. Web3 Builders Hub"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                    placeholder="Describe the purpose and goals of your group."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Visibility</Label>
                    <Select
                      value={newGroup.visibility}
                      onValueChange={(v) => setNewGroup({ ...newGroup, visibility: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Public">
                          <Globe className="w-4 h-4 inline mr-1" /> Public
                        </SelectItem>
                        <SelectItem value="Private">
                          <Lock className="w-4 h-4 inline mr-1" /> Private
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Topic</Label>
                    <Input
                      value={newGroup.topic}
                      onChange={(e) => setNewGroup({ ...newGroup, topic: e.target.value })}
                      placeholder="e.g. AI, SaaS, Web3, HealthTech"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Icon (Emoji)</Label>
                  <Input
                    value={newGroup.icon}
                    onChange={(e) => setNewGroup({ ...newGroup, icon: e.target.value })}
                    placeholder="e.g. 🚀"
                  />
                </div>
              </div>

              <DialogFooter className="mt-4">
                <Button onClick={handleCreateGroup}>Create Group</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Groups List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
        {groups.map((group, idx) => (
  <Card key={idx} className="hover:shadow-lg transition">
    <CardHeader className="flex items-center gap-3">
      <CardTitle className="flex items-center gap-2 text-lg font-semibold">
        <span className="text-2xl">{group.icon || "🌐"}</span>
        {group.name}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <p className="text-sm text-muted-foreground">{group.description}</p>
      <div className="text-xs text-muted-foreground flex flex-col">
        <span>Topic: <b>{group.topic || "General"}</b></span>
        <span>Visibility: <b>{group.visibility}</b></span>
      </div>

      {/* Check if current user is the creator */}
      {group.createdBy?._id === userId ? (
        <>
        <div className="w-full mt-2 text-center text-xs font-medium text-green-600">
          ✅ You are the admin of this group
        </div>
        <Button variant="outline" className="w-full mt-2">
          <Users className="w-4 h-4 mr-2" /> View Group
        </Button>
        </>
      ) : (
        <Button variant="outline" className="w-full mt-2">
          <Users className="w-4 h-4 mr-2" /> Join Group
        </Button>
      )}
    </CardContent>
  </Card>
))}

        </motion.div>
      </div>
    </div>
  )
}
