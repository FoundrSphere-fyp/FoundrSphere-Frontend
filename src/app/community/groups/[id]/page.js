"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Router, Users } from "lucide-react";
import { useUserStore } from "@/store/store";
import toast from "react-hot-toast";

export default function GroupPage() {
  const { id } = useParams();
  const { userId } = useUserStore();
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [members, setMembers] = useState([]);
  const [membershipStatus, setMembershipStatus] = useState("checking");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminData, setAdminData] = useState(null);

  const router = useRouter();


  const handleLeaveGroup = async (memberId) => {
  if (!confirm("Are you sure you want to leave this group?")) return;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups/leave-group`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ groupId: id })
    });

    const data = await res.json();
    
    if (data.type === "success") {
      toast.success("You have left the group");
      router.push("/community/groups");
    } else {
      toast.error(data.message);
    }
  } catch (error) {

    toast.error(error.message);
  }
};


const checkGroupMembership = async () => {
   fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups/check-group-membership`, {
        method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        groupId: id
      }),
    })
      .then(res => res.json())
      .then(data => {
        console.log(data)
        setMembershipStatus(data.status);
        const isAdmin = data.status === 'admin';
        setIsAdmin(isAdmin);
      });
}

  useEffect(() => {
    checkGroupMembership();

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups/get-group-data`, {
        method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        groupId: id
      }),
    })
      .then(res => res.json())
      .then(data => {
        setGroup(data.group)
        setAdminData(data.group.createdBy);
      
      });


    fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/get-group-posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json",
           "Authorization": `Bearer ${localStorage.getItem("token")}`
       },
      body: JSON.stringify({ groupId: id }),
    })
      .then(res => res.json())
      .then(data => setPosts(data.posts));



       fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups/get-group-members`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify({ groupId: id })
  })
    .then(res => res.json())
    .then(data => setMembers(data.members || []));
  }, [id]);

  const handlePostSubmit = async () => {
    if (!content.trim()) return;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/get-group-posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, userId }),
    });

    const data = await res.json();
    setPosts([data.post, ...posts]);
    setContent("");
  };

  if (!group) return <p className="p-10 text-center">Loading...</p>;



  if (membershipStatus === "checking") {
  return <p className="p-10 text-center text-muted-foreground">Checking group membership...</p>;
}

if (membershipStatus === "pending") {
  return (
    <div className="max-w-xl mx-auto p-10 text-center space-y-4">
      <h2 className="text-2xl font-semibold">Request Pending ⏳</h2>
      <p className="text-muted-foreground">
        Your request to join <b>{group?.name}</b> is under review by the group admin.
      </p>
    </div>
  );
}

if (membershipStatus === "rejected") {
  return (
    <div className="max-w-xl mx-auto p-10 text-center space-y-4">
      <h2 className="text-2xl font-semibold text-red-500">Request Rejected ❌</h2>
      <p className="text-muted-foreground">
        Your request to join <b>{group?.name}</b> was rejected. You may contact the admin if you think this is a mistake.
      </p>
    </div>
  );
}
if (membershipStatus === "not_joined") {
  return (
    <div className="max-w-xl mx-auto p-10 text-center space-y-4">
      <h2 className="text-2xl font-semibold text-red-500">Join the Group ❌</h2>
      <p className="text-muted-foreground">
        Join the group to view its details.
      </p>
    </div>
  );
}

return (
  <div className="max-w-7xl mx-auto p-8 grid grid-cols-4 gap-8">
      
      {/* LEFT CONTENT */}
      <div className="col-span-3 space-y-8">

        {/* Group Header */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl font-semibold">
              <span className="text-3xl">{group.icon}</span> {group.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground">
            <p>{group.description}</p>
            <p><b>Topic:</b> {group.topic}</p>
            <p><b>Visibility:</b> {group.visibility}</p>
            <p><b>Members:</b> {members.length}</p>

            {isAdmin ? (
              <p className="text-primary font-medium">You are the admin of this group ✅</p>
            ) : (
              <Button variant="outline" className="mt-2">
                <Users className="w-4 h-4 mr-2" /> Leave Group
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Create Post */}
        <Card className="shadow-sm p-4">
          <textarea
            className="w-full border rounded-md p-3 text-sm bg-background"
            placeholder="Share something with the group..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <Button onClick={handlePostSubmit} className="mt-2">Post</Button>
        </Card>

        {/* Posts List */}
        <div className="space-y-4">
          {posts.map((post, index) => (
            <Card key={index} className="p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">@{post.author?.username}</p>
              <p className="mt-1">{post.content}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(post.createdAt).toLocaleString()}
              </p>
            </Card>
          ))}
        </div>

      </div>

      {/* RIGHT SIDEBAR MEMBERS */}
      <aside className="col-span-1 space-y-4">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-4 h-4" /> Members ({members.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
            {
              adminData && (
              <div className="flex items-center justify-between gap-3 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {adminData.fullName} <span className="text-gray-400">@{adminData.username}</span>
                  </span>
                  <span className="text-xs text-primary">(Admin)</span>
                </div>
              </div>
              )
            }
           {members.map((member) => (
  <div key={member._id} className="flex items-center justify-between gap-3 text-sm">
    <div className="flex items-center gap-2">
      <span className="font-medium">
        {member.user.fullName} <span className="text-gray-400">@{member.user.username}</span>
      </span>
      {member.user._id === group.createdBy && (
        <span className="text-xs text-primary">(Admin)</span>
      )}
    </div>
    {member.user._id === userId && member.user._id !== group.createdBy && (
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-xs text-red-600 hover:text-red-700"
        onClick={() => handleLeaveGroup(member._id)}
      >
        Leave
      </Button>
    )}
  </div>
))}
          </CardContent>
        </Card>
      </aside>

  </div>
);
}
