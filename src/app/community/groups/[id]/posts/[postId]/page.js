"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  ArrowLeft,
  Heart, 
  MessageCircle, 
  ChevronLeft, 
  ChevronRight,
  Send,
  Loader2
} from "lucide-react";
import { useUserStore } from "@/store/store";
import toast from "react-hot-toast";

export default function PostDetailPage() {
  const { id: groupId, postId } = useParams();
  const { userId } = useUserStore();
  const router = useRouter();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchPostDetails();
  }, [postId]);

  const fetchPostDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/get-single-post`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ postId }),
      });

      const data = await res.json();
      
      if (data.type === "success") {
        setPost(data.post);
      } else {
        toast.error("Failed to load post");
        router.back();
      }
    } catch (error) {
      toast.error("Failed to load post");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleLikeToggle = async () => {
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
        setPost({
          ...post,
          likes: data.isLiked 
            ? [...post.likes, userId] 
            : post.likes.filter(id => id !== userId)
        });
      }
    } catch (error) {
      toast.error("Failed to like post");
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    setSubmittingComment(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/add-comment`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ 
          postId,
          content: commentText.trim()
        }),
      });

      const data = await res.json();
      
      if (data.type === "success") {
        setPost({
          ...post,
          comments: [...post.comments, data.comment]
        });
        setCommentText("");
        toast.success("Comment added!");
      } else {
        toast.error(data.message || "Failed to add comment");
      }
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const nextMedia = () => {
    if (post?.media && currentMediaIndex < post.media.length - 1) {
      setCurrentMediaIndex(currentMediaIndex + 1);
    }
  };

  const prevMedia = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(currentMediaIndex - 1);
    }
  };

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
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <p className="text-muted-foreground">Post not found</p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const isLiked = post.likes.includes(userId);

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Group
      </Button>

      {/* Post Card */}
      <Card className="shadow-lg">
        {/* Post Header */}
        <div className="p-6 border-b">
          <div className="flex items-start gap-3">
            <Avatar className="w-14 h-14">
              <AvatarImage src={post.author?.profilePicture} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(post.author?.fullName)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{post.author?.fullName}</h3>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {getUserTypeLabel(post.author?.userType)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">@{post.author?.username}</p>
              {post.author?.bio && (
                <p className="text-sm text-muted-foreground mt-2">{post.author?.bio}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(post.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
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
          <div className="p-6 border-b">
            <p className="text-base whitespace-pre-wrap leading-relaxed">{post.content}</p>
          </div>
        )}

        {/* Media Carousel */}
        {post.media && post.media.length > 0 && (
          <div className="relative bg-black">
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

            {post.media.length > 1 && (
              <>
                <button
                  onClick={prevMedia}
                  disabled={currentMediaIndex === 0}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                <button
                  onClick={nextMedia}
                  disabled={currentMediaIndex === post.media.length - 1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
                  {currentMediaIndex + 1} / {post.media.length}
                </div>

                {/* Dots Indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {post.media.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentMediaIndex(index)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        index === currentMediaIndex 
                          ? 'bg-white w-8' 
                          : 'bg-white/50 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Likes and Comments Stats */}
        <div className="px-6 py-4 border-b flex items-center gap-6">
          <button 
            onClick={handleLikeToggle}
            className="flex items-center gap-2 text-base hover:text-red-500 transition-colors"
          >
            <Heart 
              className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`}
            />
            <span className="font-medium">{post.likes.length}</span>
            <span className="text-muted-foreground">
              {post.likes.length === 1 ? 'Like' : 'Likes'}
            </span>
          </button>

          <div className="flex items-center gap-2 text-base text-muted-foreground">
            <MessageCircle className="w-6 h-6" />
            <span className="font-medium">{post.comments.length}</span>
            <span>{post.comments.length === 1 ? 'Comment' : 'Comments'}</span>
          </div>
        </div>

        {/* Comments Section */}
        <div className="p-6">
          <h3 className="font-semibold text-xl mb-4">Comments</h3>
          
          {/* Comment Input */}
          <div className="flex gap-3 mb-6">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-secondary">
                {getInitials(post.author?.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !submittingComment) {
                    handleSubmitComment();
                  }
                }}
                className="flex-1 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={submittingComment}
              />
              <Button 
                onClick={handleSubmitComment}
                disabled={submittingComment || !commentText.trim()}
              >
                {submittingComment ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {post.comments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              post.comments.map((comment, index) => (
                <div key={index} className="flex gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={comment.user?.profilePicture} />
                    <AvatarFallback className="bg-secondary text-sm">
                      {getInitials(comment.user?.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="bg-secondary rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm">{comment.user?.fullName}</p>
                        <span className="text-xs text-muted-foreground">
                          @{comment.user?.username}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 ml-2">
                      {new Date(comment.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}