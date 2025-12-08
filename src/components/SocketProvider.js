"use client";
import { useUserStore } from '@/store/store';
import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export function SocketProvider({ children }) {
  const { userId } = useUserStore();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');

    // Wait for userId to be available
    if (!userId || !token) {
      console.log('⚠️ No userId or token found, skipping socket connection');
      console.log('userId:', userId, 'token:', !!token);
      return;
    }

    console.log('🔌 Connecting to Socket.IO server...');
    
    // ✅ Fix: Remove /api/v1 from the URL - Socket.IO uses root path
    const socketUrl = process.env.NEXT_PUBLIC_API_URL 
      ? process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '') 
      : 'http://localhost:8080';
    
    console.log('Socket URL:', socketUrl);
    console.log('User ID:', userId);

    // Connect to Socket.IO server
    const socketInstance = io(socketUrl, {
      path: '/socket.io/', // ✅ Default Socket.IO path
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
    });

    socketInstance.on('connect', () => {
      console.log('✅ Socket connected:', socketInstance.id);
      setIsConnected(true);
      
      // Register user with backend
      console.log('📝 Registering user:', userId);
      socketInstance.emit('register', userId);
    });

    socketInstance.on('receive_message', (message) => {
      console.log('📩 New message received from', message.senderId);
      toast.success('New message received');
    });


    socketInstance.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected. Reason:', reason);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      console.error('Error details:', error);
      setIsConnected(false);
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      // Re-register user after reconnection
      socketInstance.emit('register', userId);
    });

    socketInstance.on('reconnect_error', (error) => {
      console.error('❌ Reconnection error:', error.message);
    });

    socketInstance.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed');
    });

    setSocket(socketInstance);

    return () => {
      console.log('🔌 Disconnecting socket...');
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}