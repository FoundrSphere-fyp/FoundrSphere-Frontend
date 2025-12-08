"use client";
import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/components/SocketProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, Circle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUserStore } from '@/store/store';

export default function ChatPage() {
  const { id: conversationId } = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { socket, isConnected } = useSocket();
  const messagesEndRef = useRef(null);

  const { userId } = useUserStore();

  useEffect(() => {
    if (conversationId) {
      fetchConversationDetails();
      fetchMessages();
    }
  }, [conversationId, userId]);

  useEffect(() => {
    if (!socket) return;

    // Listen for incoming messages
    const handleReceiveMessage = (message) => {
      console.log('Received message:', message);
      if (message.senderId !== userId) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
        toast.success('New message received');
      }
    };

    // Listen for sent message confirmation
    const handleMessageSent = (message) => {
      console.log('Message sent confirmation:', message);
      
      // ✅ Find and replace the temporary message with the real one
      setMessages(prev => {
        const hasTemp = prev.some(msg => msg.tempId && msg.content === message.content);
        
        if (hasTemp) {
          // Replace temp message with real one
          return prev.map(msg =>
            msg.tempId && msg.content === message.content
              ? { ...message, senderId: message.senderId, sender: message.sender }
              : msg
          );
        } else {
          // If no temp message found, just add the new one (shouldn't happen)
          console.warn('No temp message found for:', message);
          return prev;
        }
      });
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_sent', handleMessageSent);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_sent', handleMessageSent);
    };
  }, [socket, userId]);

  const fetchConversationDetails = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/get-conversations`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await res.json();
      console.log('Conversations response:', data);

      if (data.type === 'success') {
        const conv = data.conversations.find(c => c._id === conversationId);
        console.log('Found conversation:', conv);

        if (conv) {
          const other = conv.participants.find(p => p._id !== userId);
          console.log('Other user:', other);
          setOtherUser(other);
        } else {
          console.error('Conversation not found in list');
          toast.error('Conversation not found');
        }
      } else {
        console.error('Failed to fetch conversations:', data.message);
        toast.error(data.message || 'Failed to load conversation details');
      }
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
      toast.error('Failed to load conversation details');
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      console.log('Fetching messages for conversation:', conversationId);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/get-messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ conversationId })
      });

      const data = await res.json();
      console.log('Messages response:', data);

      if (data.type === 'success') {
        setMessages(data.messages || []);
        scrollToBottom();
      } else {
        console.error('Failed to fetch messages:', data.message);
        toast.error(data.message || 'Failed to load messages');
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !socket || !otherUser) {
      console.log('Cannot send message:', {
        hasMessage: !!newMessage.trim(),
        hasSocket: !!socket,
        hasOtherUser: !!otherUser
      });
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const messageData = {
      senderId: userId,
      receiverId: otherUser._id,
      content: newMessage
    };

    console.log('Sending message:', messageData);

    // Optimistically add message to UI
    const optimisticMessage = {
      _id: tempId,
      tempId,
      senderId: userId,
      receiverId: otherUser._id,
      content: newMessage,
      createdAt: new Date()
    };
    setMessages(prev => [...prev, optimisticMessage]);

    // Send via socket
    socket.emit('send_message', messageData);

    setNewMessage('');
    scrollToBottom();
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="flex-1">
          <h2 className="text-xl font-bold flex items-center gap-2">
            {otherUser?.fullName || 'Loading...'}
            {isConnected && (
              <Circle className="w-2 h-2 fill-green-500 text-green-500" />
            )}
          </h2>
          <p className="text-sm text-gray-600">@{otherUser?.username || '...'} Your id: {userId}</p>
        </div>

        {!isConnected && (
          <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
            Disconnected
          </span>
        )}
      </div>

      {/* Messages */}
      <Card className="flex-1 p-4 overflow-y-auto m-4 mb-2">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              // Determine if this message is from current user
              // Check both senderId (optimistic) and sender._id (database)
              const isMyMessage = msg.senderId === userId || msg.sender?._id === userId;

              return (
                <div
                  key={msg._id || msg.tempId}
                  className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                >
                  {console.log('Rendering message:', msg, 'isMyMessage:', isMyMessage)}
                  <div
                    className={`max-w-xs p-3 rounded-lg ${isMyMessage
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-black'
                      }`}
                  >
                    <p className="break-words">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1 flex items-center gap-1">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                      {msg.tempId && <span className="italic">(Sending...)</span>}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </Card>

      {/* Input */}
      <div className="p-4 pt-2 bg-white border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
            disabled={!isConnected}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!isConnected || !newMessage.trim()}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}