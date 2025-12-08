"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Search, Loader2, Users, Clock } from 'lucide-react';
import { useUserStore } from '@/store/store';
import toast from 'react-hot-toast';

export default function ChatInboxPage() {
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { userId } = useUserStore();

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    // Filter conversations based on search query
    if (searchQuery.trim()) {
      const filtered = conversations.filter(conv => {
        const otherUser = getOtherParticipant(conv.participants);
        return (
          otherUser?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          otherUser?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
      setFilteredConversations(filtered);
    } else {
      setFilteredConversations(conversations);
    }
  }, [searchQuery, conversations]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/get-conversations`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await res.json();
      console.log('Conversations response:', data);

      if (data.type === 'success') {
        setConversations(data.conversations);
        setFilteredConversations(data.conversations);
      } else {
        toast.error(data.message || 'Failed to load conversations');
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const getOtherParticipant = (participants) => {
    return participants?.find(p => p._id !== userId);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Loading conversations...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Messages</h1>
              <p className="text-muted-foreground mt-1">
                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Button
              onClick={() => router.push('/founders')}
              variant="outline"
              className="gap-2"
            >
              <Users className="w-4 h-4" />
              New Chat
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations List */}
        {filteredConversations.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? 'No conversations found' : 'No messages yet'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? 'Try searching with different keywords'
                    : 'Start a conversation with a founder'
                  }
                </p>
                {!searchQuery && (
                  <Button onClick={() => router.push('/founders')}>
                    <Users className="w-4 h-4 mr-2" />
                    Browse Founders
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredConversations.map((conv) => {
              const otherUser = getOtherParticipant(conv.participants);
              
              return (
                <Card
                  key={conv._id}
                  className="p-4 cursor-pointer hover:shadow-md hover:border-primary/50 transition-all duration-200"
                  onClick={() => router.push(`/chat/${conv._id}`)}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                      {otherUser?.fullName?.charAt(0).toUpperCase() || '?'}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-lg truncate">
                          {otherUser?.fullName || 'Unknown User'}
                        </h3>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(conv.lastMessageAt)}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground mb-1">
                        @{otherUser?.username || 'unknown'}
                      </p>

                      {/* Last Message */}
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate flex-1">
                          {conv.lastMessage || 'No messages yet'}
                        </p>
                        
                        {/* Unread Badge (optional - can be added later) */}
                        {/* <Badge variant="default" className="ml-2">3</Badge> */}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}