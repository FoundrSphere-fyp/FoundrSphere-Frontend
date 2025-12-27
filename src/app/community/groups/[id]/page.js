"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Router, Users, Upload, X, Loader2, Image as ImageIcon, Video, Heart, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
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

  const router = useRouter();

  // ...existing code for handleLeaveGroup, checkGroupMembership, useEffect...

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
  }, [id]);

  // Handle file selection
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

  // Remove file from selection
  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setUploadedAssets(prev => prev.filter((_, i) => i !== index));
  };

  // Upload files to Cloudinary
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
    if (!content.trim() && selectedFiles.length === 0) {
      toast.error("Please add some content or upload media");
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
        media: mediaAssets.map(asset => ({
          url: asset.url,
          type: asset.resourceType,
          publicId: asset.publicId
        }))
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

  // Handle like toggle
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
        // Update local state
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

          {/* File Previews */}
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

          {/* Action Buttons */}
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
              disabled={posting || uploading || (!content.trim() && selectedFiles.length === 0)}
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

        {/* Posts List with Enhanced Design */}
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard 
              key={post._id} 
              post={post} 
              userId={userId}
              onLike={handleLikeToggle}
            />
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

// Enhanced Post Card Component with Carousel
function PostCard({ post, userId, onLike }) {
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

  const isLiked = post.likes.includes(userId);

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

      {/* Post Content */}
      {post.content && (
        <div className="px-4 py-3">
          <p className="text-sm whitespace-pre-wrap">{post.content}</p>
        </div>
      )}

      {/* Media Carousel */}
      {post.media && post.media.length > 0 && (
        <div className="relative bg-black">
          {/* Current Media */}
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
                controls 
                className="w-full h-full object-contain"
              />
            )}
          </div>

          {/* Navigation Arrows */}
          {post.media.length > 1 && (
            <>
              <button
                onClick={prevMedia}
                disabled={currentMediaIndex === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={nextMedia}
                disabled={currentMediaIndex === post.media.length - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Media Counter */}
              <div className="absolute bottom-2 right-2 bg-black/70 text-white px-3 py-1 rounded-full text-xs">
                {currentMediaIndex + 1} / {post.media.length}
              </div>
            </>
          )}

          {/* Dots Indicator */}
          {post.media.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {post.media.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentMediaIndex(index)}
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

        <button className="flex items-center gap-2 text-sm hover:text-blue-500 transition-colors">
          <MessageCircle className="w-5 h-5" />
          <span>{post.comments.length} {post.comments.length === 1 ? 'Comment' : 'Comments'}</span>
        </button>
      </div>
    </Card>
  );
}