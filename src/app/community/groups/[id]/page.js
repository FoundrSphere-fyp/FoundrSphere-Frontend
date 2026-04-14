"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Users, Upload, X, Loader2, Video, Heart, MessageCircle, ChevronLeft, ChevronRight, Calendar, MapPin, Link2, Monitor } from "lucide-react";
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
  
  // New states for media upload
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [uploadedAssets, setUploadedAssets] = useState([]);

  const [groupEvents, setGroupEvents] = useState([]);
  const [createEvent, setCreateEvent] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventHosts, setEventHosts] = useState("");
  const [eventStart, setEventStart] = useState("");
  const [eventEnd, setEventEnd] = useState("");
  const [eventIsOnline, setEventIsOnline] = useState(false);
  const [eventCreateMeet, setEventCreateMeet] = useState(false);
  const [eventLocation, setEventLocation] = useState("");

  const router = useRouter();

  const fetchGroupEvents = useCallback(() => {
    if (!id) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups/get-group-events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ groupId: id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.type === "success" && data.events) {
          setGroupEvents(data.events);
        }
      })
      .catch(() => {});
  }, [id]);

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
      headers: { 
        "Content-Type": "application/json",
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

    fetchGroupEvents();
  }, [id, fetchGroupEvents]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/') || file.type.startsWith('video/');
      if (!isValid) {
        toast.error(`${file.name} is not a valid image or video file`);
      }
      return isValid;
    });

    if (validFiles.length === 0) return;

    setSelectedFiles(prev => [...prev, ...validFiles]);
    
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, {
          url: reader.result,
          type: file.type.startsWith('image/') ? 'image' : 'video',
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setUploadedAssets(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0) return [];

    setUploading(true);

    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/upload-asset`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`
          },
          body: formData
        });

        const data = await response.json();
        return data.data;
      });

      const results = await Promise.all(uploadPromises);
      setUploadedAssets(results);
      return results;
    } catch (error) {
      toast.error('Failed to upload files');
      console.error('Upload error:', error);
      return [];
    } finally {
      setUploading(false);
    }
  };

  const handlePostSubmit = async () => {
    let eventPayload = null;
    if (createEvent) {
      if (!eventTitle.trim() || !eventStart) {
        toast.error("Event title and start date/time are required.");
        return;
      }
      if (!eventIsOnline && !eventLocation.trim()) {
        toast.error("Add a location for in-person events, or switch to online.");
        return;
      }
      eventPayload = {
        title: eventTitle.trim(),
        description: eventDescription.trim(),
        hosts: eventHosts,
        startAt: new Date(eventStart).toISOString(),
        endAt: eventEnd ? new Date(eventEnd).toISOString() : undefined,
        isOnline: eventIsOnline,
        createMeet: Boolean(eventIsOnline && eventCreateMeet),
        location: eventIsOnline ? "" : eventLocation.trim(),
      };
    }

    const hasBody =
      content.trim() ||
      selectedFiles.length > 0 ||
      (eventPayload && eventPayload.title);

    if (!hasBody) {
      toast.error("Add post text, media, or schedule an event.");
      return;
    }

    setPosting(true);

    try {
      let mediaAssets = uploadedAssets;
      if (selectedFiles.length > 0 && uploadedAssets.length === 0) {
        mediaAssets = await handleUploadFiles();
      }

      const postData = {
        content: content.trim(),
        userId,
        groupId: id,
        media: mediaAssets.map((asset) => ({
          url: asset.url,
          type: asset.resourceType,
          publicId: asset.publicId,
        })),
        ...(eventPayload ? { event: eventPayload } : {}),
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/create-group-post`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(postData),
      });

      const data = await res.json();
      
      if (data.success) {
        setPosts([data.post, ...posts]);
        setContent("");
        setSelectedFiles([]);
        setPreviews([]);
        setUploadedAssets([]);
        setCreateEvent(false);
        setEventTitle("");
        setEventDescription("");
        setEventHosts("");
        setEventStart("");
        setEventEnd("");
        setEventIsOnline(false);
        setEventCreateMeet(false);
        setEventLocation("");
        fetchGroupEvents();
        toast.success("Post created successfully!");
      } else {
        toast.error(data.message || "Failed to create post");
      }
    } catch (error) {
      toast.error("Failed to create post");
      console.error("Post error:", error);
    } finally {
      setPosting(false);
    }
  };

  const handleLikeToggle = async (postId) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/toggle-like`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ postId }),
      });

      const data = await res.json();
      
      if (data.type === "success") {
        setPosts(posts.map(post => 
          post._id === postId 
            ? { 
                ...post, 
                likes: data.isLiked 
                  ? [...post.likes, userId] 
                  : post.likes.filter(id => id !== userId)
              }
            : post
        ));
      }
    } catch (error) {
      toast.error("Failed to like post");
    }
  };

  // Navigate to post detail page
  const handleOpenPost = (postId) => {
    router.push(`/community/groups/${id}/posts/${postId}`);
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
          Your request to join <b>{group?.name}</b> was rejected.
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
              <Button variant="outline" className="mt-2" onClick={() => handleLeaveGroup()}>
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
            rows="3"
            disabled={posting || uploading}
          />

          <div className="mt-4 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-4 space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={createEvent}
                onChange={(e) => {
                  setCreateEvent(e.target.checked);
                  if (!e.target.checked) {
                    setEventCreateMeet(false);
                  }
                }}
                disabled={posting || uploading}
                className="rounded border-input"
              />
              <Calendar className="w-4 h-4" />
              Schedule an event with this post
            </label>

            {createEvent && (
              <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-border/60">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Event title *</label>
                  <input
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="Workshop, AMA, demo day…"
                    disabled={posting || uploading}
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Description</label>
                  <textarea
                    className="w-full border rounded-md p-2 text-sm bg-background min-h-[72px]"
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    placeholder="What should members expect?"
                    disabled={posting || uploading}
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Hosts (comma-separated)</label>
                  <input
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                    value={eventHosts}
                    onChange={(e) => setEventHosts(e.target.value)}
                    placeholder="Jane Doe, John Smith"
                    disabled={posting || uploading}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Starts *</label>
                  <input
                    type="datetime-local"
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                    value={eventStart}
                    onChange={(e) => setEventStart(e.target.value)}
                    disabled={posting || uploading}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Ends (optional)</label>
                  <input
                    type="datetime-local"
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                    value={eventEnd}
                    onChange={(e) => setEventEnd(e.target.value)}
                    disabled={posting || uploading}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={eventIsOnline}
                    onChange={(e) => {
                      setEventIsOnline(e.target.checked);
                      if (!e.target.checked) setEventCreateMeet(false);
                    }}
                    disabled={posting || uploading}
                    className="rounded border-input"
                  />
                  <Monitor className="w-4 h-4 shrink-0" />
                  Online event
                </label>
                {eventIsOnline && (
                  <label className="flex items-center gap-2 text-sm sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={eventCreateMeet}
                      onChange={(e) => setEventCreateMeet(e.target.checked)}
                      disabled={posting || uploading}
                      className="rounded border-input"
                    />
                    <Link2 className="w-4 h-4 shrink-0" />
                    Create FoundrSphere video room (meetup.foundrsphere.com)
                  </label>
                )}
                {!eventIsOnline && (
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Location *
                    </label>
                    <input
                      className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                      value={eventLocation}
                      onChange={(e) => setEventLocation(e.target.value)}
                      placeholder="Venue or address"
                      disabled={posting || uploading}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {previews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative group">
                  {preview.type === 'image' ? (
                    <img
                      src={preview.url}
                      alt={preview.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="relative">
                      <video
                        src={preview.url}
                        className="w-full h-48 object-cover rounded-lg"
                        controls
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <Video className="w-12 h-12 text-white opacity-70" />
                      </div>
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={uploading || posting}
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {uploadedAssets[index] && (
                    <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                      ✓ Uploaded
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-md cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                <span className="text-sm">Add Photo/Video</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading || posting}
                />
              </label>

              {uploading && (
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </span>
              )}
            </div>

            <Button 
              onClick={handlePostSubmit} 
              disabled={
                posting ||
                uploading ||
                (!content.trim() &&
                  selectedFiles.length === 0 &&
                  !(createEvent && eventTitle.trim() && eventStart && (eventIsOnline || eventLocation.trim())))
              }
              className="flex items-center gap-2"
            >
              {posting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Posting...
                </>
              ) : (
                'Post'
              )}
            </Button>
          </div>
        </Card>

        {/* Posts List */}
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard 
              key={post._id} 
              post={post} 
              userId={userId}
              onLike={handleLikeToggle}
              onReadMore={handleOpenPost}
            />
          ))}
        </div>

      </div>

      {/* RIGHT SIDEBAR */}
      <aside className="col-span-1 space-y-4">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Group events
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[320px] overflow-y-auto text-sm">
            {groupEvents.length === 0 ? (
              <p className="text-muted-foreground text-xs">No events yet. Schedule one when you post.</p>
            ) : (
              groupEvents.map((ev) => (
                <div
                  key={ev._id}
                  className="rounded-md border border-border/80 p-3 space-y-1.5"
                >
                  <p className="font-medium leading-tight">{ev.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(ev.startAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                    {ev.endAt &&
                      ` – ${new Date(ev.endAt).toLocaleTimeString(undefined, { timeStyle: "short" })}`}
                  </p>
                  {ev.hosts?.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Hosts: {ev.hosts.join(", ")}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {ev.isOnline ? (
                      <span className="text-[10px] uppercase tracking-wide bg-primary/10 text-primary px-2 py-0.5 rounded">
                        Online
                      </span>
                    ) : (
                      <span className="text-[10px] flex items-center gap-0.5 text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {ev.location || "In person"}
                      </span>
                    )}
                  </div>
                  {ev.meetUrl && (
                    <a
                      href={ev.meetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <Link2 className="w-3 h-3" />
                      Join video room
                    </a>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-4 h-4" /> Members ({members.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
            {adminData && (
              <div className="flex items-center justify-between gap-3 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {adminData.fullName} <span className="text-gray-400">@{adminData.username}</span>
                  </span>
                  <span className="text-xs text-primary">(Admin)</span>
                </div>
              </div>
            )}
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

// Post Card Component
function PostCard({ post, userId, onLike, onReadMore }) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  
  const nextMedia = () => {
    if (currentMediaIndex < post.media.length - 1) {
      setCurrentMediaIndex(currentMediaIndex + 1);
    }
  };

  const prevMedia = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(currentMediaIndex - 1);
    }
  };

  const isLiked = Array.isArray(post.likes) && post.likes.some(
    (id) => String(id) === String(userId)
  );

  const getUserTypeLabel = (userType) => {
    const labels = {
      'founder': '👑 Founder',
      'investor': '💼 Investor',
      'student': '🎓 Student',
      'professional': '💻 Professional'
    };
    return labels[userType] || userType;
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const truncateText = (text, maxLength = 200) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      {/* Post Header */}
      <div className="p-4 border-b">
        <div className="flex items-start gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={post.author?.profilePicture} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(post.author?.fullName || 'User')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-base">{post.author?.fullName}</h4>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {getUserTypeLabel(post.author?.userType)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">@{post.author?.username}</p>
            {post.author?.bio && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.author?.bio}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </div>

      {post.eventId && typeof post.eventId === "object" && (
        <div className="px-4 py-3 bg-primary/5 border-b border-primary/15">
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 mt-0.5 text-primary shrink-0" />
            <div className="min-w-0 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Event
              </p>
              <p className="font-semibold text-sm">{post.eventId.title}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(post.eventId.startAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
                {post.eventId.endAt &&
                  ` – ${new Date(post.eventId.endAt).toLocaleTimeString(undefined, {
                    timeStyle: "short",
                  })}`}
              </p>
              {post.eventId.hosts?.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Hosts: {post.eventId.hosts.join(", ")}
                </p>
              )}
              {post.eventId.isOnline ? (
                <span className="inline-block text-[10px] uppercase bg-primary/15 text-primary px-2 py-0.5 rounded">
                  Online
                </span>
              ) : (
                post.eventId.location && (
                  <p className="text-xs flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {post.eventId.location}
                  </p>
                )
              )}
              {post.eventId.meetUrl && (
                <a
                  href={post.eventId.meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline pt-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link2 className="w-3 h-3" />
                  Join video room
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Post Content */}
      {post.content && (
        <div className="px-4 py-3">
          <p className="text-sm whitespace-pre-wrap">{truncateText(post.content)}</p>
          {post.content.length > 200 && (
            <Button 
              variant="link" 
              className="p-0 h-auto text-primary text-sm mt-1"
              onClick={() => onReadMore(post._id)}
            >
              Read More
            </Button>
          )}
        </div>
      )}

      {/* Media Carousel */}
      {post.media && post.media.length > 0 && (
        <div className="relative bg-black cursor-pointer" onClick={() => onReadMore(post._id)}>
          <div className="aspect-video">
            {post.media[currentMediaIndex].type === 'image' ? (
              <img 
                src={post.media[currentMediaIndex].url} 
                alt="Post media" 
                className="w-full h-full object-contain"
              />
            ) : (
              <video 
                src={post.media[currentMediaIndex].url} 
                className="w-full h-full object-contain"
              />
            )}
          </div>

          {post.media.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevMedia();
                }}
                disabled={currentMediaIndex === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextMedia();
                }}
                disabled={currentMediaIndex === post.media.length - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <div className="absolute bottom-2 right-2 bg-black/70 text-white px-3 py-1 rounded-full text-xs">
                {currentMediaIndex + 1} / {post.media.length}
              </div>
            </>
          )}

          {post.media.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {post.media.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentMediaIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentMediaIndex 
                      ? 'bg-white w-6' 
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Post Actions */}
      <div className="px-4 py-3 border-t flex items-center gap-6">
        <button 
          onClick={() => onLike(post._id)}
          className="flex items-center gap-2 text-sm hover:text-red-500 transition-colors"
        >
          <Heart 
            className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`}
          />
          <span>{post.likes.length} {post.likes.length === 1 ? 'Like' : 'Likes'}</span>
        </button>

        <button 
          onClick={() => onReadMore(post._id)}
          className="flex items-center gap-2 text-sm hover:text-blue-500 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{post.comments.length} {post.comments.length === 1 ? 'Comment' : 'Comments'}</span>
        </button>
      </div>
    </Card>
  );
}