"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageCircle, 
  Send, 
  Plus, 
  Trash2, 
  Menu,
  Loader2,
  Sparkles,
  X
} from 'lucide-react';
import { useUserStore } from '@/store/store';
import toast from 'react-hot-toast';

export default function ChatbotPage() {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [fetchingConversations, setFetchingConversations] = useState(true);
  const messagesEndRef = useRef(null);
  const router = useRouter();
  const [sessionId, setSessionId] = useState(null);

  const { userId } = useUserStore();

  useEffect(() => {
   
    fetchConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setFetchingConversations(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chatbot/conversations`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await res.json();
      if (data.type === 'success') {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setFetchingConversations(false);
    }
  };

  const createNewConversation = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chatbot/conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title: 'New Chat' })
      });

      const data = await res.json();
      if (data.type === 'success') {
        setConversations([data.conversation, ...conversations]);
        setCurrentConversation(data.conversation);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
      toast.error('Failed to create conversation');
    }
  };

  const loadConversation = async (conversationId) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chatbot/conversation/${conversationId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      const data = await res.json();
      if (data.type === 'success') {
        setCurrentConversation(data.conversation);
        setMessages(data.conversation.messages || []);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
      toast.error('Failed to load conversation');
    }
  };

  const deleteConversation = async (conversationId, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chatbot/conversation/${conversationId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      const data = await res.json();
      if (data.type === 'success') {
        setConversations(conversations.filter(c => c._id !== conversationId));
        if (currentConversation?._id === conversationId) {
          setCurrentConversation(null);
          setMessages([]);
        }
        toast.success('Conversation deleted');
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // If no current conversation, create one first
    if (!currentConversation) {
      await createNewConversation();
      // Wait a bit for state to update
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const userMessage = input.trim();
    setInput('');

    // Add user message to UI immediately
    const tempUserMsg = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      setLoading(true);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chatbot/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          conversationId: currentConversation._id,
          message: userMessage,
          sessionId
        })
      });

      const data = await res.json();
      if (data.type === 'success') {
         if (data.sessionId) {
      setSessionId(data.sessionId);
    }

        setMessages(prev => [...prev, data.message]);
        
        // Refresh conversations list to update titles
        fetchConversations();
      } else {
        toast.error(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-background to-muted">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-80' : 'w-0'
        } bg-card border-r transition-all duration-300 flex flex-col overflow-hidden`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b">
          <Button
            onClick={createNewConversation}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {fetchingConversations ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 px-4">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Start a new chat!</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv._id}
                onClick={() => loadConversation(conv._id)}
                className={`group relative p-3 rounded-lg cursor-pointer transition-all ${
                  currentConversation?._id === conv._id
                    ? 'bg-muted border'
                    : 'bg-muted/50 hover:bg-muted border border-transparent'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium truncate">
                      {conv.title}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {conv.lastMessage}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(conv.lastMessageAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => deleteConversation(conv._id, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-card border-b p-4">
          <div className="flex items-center justify-between mx-auto">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <div className="flex items-center space-x-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">
                  AI Assistant
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 && !loading && (
              <div className="text-center py-20">
                <Sparkles className="h-16 w-16 mx-auto mb-6 text-primary opacity-50" />
                <h2 className="text-2xl font-bold mb-3">
                  How can I help you today?
                </h2>
                <p className="text-muted-foreground">
                  Ask me anything about startups, business strategies, or entrepreneurship.
                </p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted border'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {msg.role === 'assistant' && (
                      <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-2">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted border rounded-2xl p-4">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-card border-t p-4">
          <form onSubmit={sendMessage} className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(e);
                    }
                  }}
                  placeholder="Type your message... (Shift+Enter for new line)"
                  className="w-full resize-none min-h-[60px] max-h-[200px] pr-12"
                  rows={1}
                />
              </div>
              <Button
                type="submit"
                disabled={!input.trim() || loading}
                className="h-[60px] px-6"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
