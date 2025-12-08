"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Mail, MapPin, Briefcase, Users, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function FoundersPage() {
  const [founders, setFounders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingConversation, setLoadingConversation] = useState(null);
  const router = useRouter();
  const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  useEffect(() => {
    fetchFounders();
  }, []);

  const fetchFounders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/founders/get-founders`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      
      if (data.type === 'success') {
        // Filter out current user
        const filteredFounders = data.founders.filter(founder => founder._id !== currentUserId);
        setFounders(filteredFounders);
      } else {
        toast.error(data.message || 'Failed to load founders');
      }
    } catch (error) {
      console.error('Failed to fetch founders:', error);
      toast.error('Failed to load founders');
    } finally {
      setLoading(false);
    }
  };

  const startConversation = async (founderId) => {
    try {
      setLoadingConversation(founderId);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/get-or-create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ receiverId: founderId })
      });

      const data = await res.json();
      if (data.type === 'success') {
        router.push(`/chat/${data.conversation._id}`);
      } else {
        toast.error(data.message || 'Failed to start conversation');
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
      toast.error('Failed to start conversation');
    } finally {
      setLoadingConversation(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading founders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Discover Founders 🚀
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with fellow entrepreneurs, share ideas, and build the future together.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{founders.length} founders in the community</span>
          </div>
        </div>

        {/* Founders Grid */}
        {founders.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <Users className="w-16 h-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold mb-2">No founders yet</h3>
                <p className="text-muted-foreground">
                  Be the first to join the community!
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {founders.map((founder) => (
              <Card 
                key={founder._id} 
                className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader className="space-y-4">
                  {/* Avatar & Name */}
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                      {founder.fullName?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1">
                        {founder.fullName || 'Unknown'}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        @{founder.username}
                      </p>
                    </div>
                  </div>

                  {/* Role Badge */}
                  <Badge variant="secondary" className="w-fit">
                    <Briefcase className="w-3 h-3 mr-1" />
                    Founder
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Email */}
                  {founder.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{founder.email}</span>
                    </div>
                  )}

                  {/* Location (if available) */}
                  {founder.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{founder.location}</span>
                    </div>
                  )}

                  {/* Bio/Description (if available) */}
                  {founder.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {founder.bio}
                    </p>
                  )}

                  {/* Joined Date */}
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Joined {new Date(founder.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </div>

                  {/* Message Button */}
                  <Button 
                    onClick={() => startConversation(founder._id)}
                    disabled={loadingConversation === founder._id}
                    className="w-full"
                    variant="default"
                  >
                    {loadingConversation === founder._id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Starting chat...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}