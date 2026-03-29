"use client"

import React, { createContext, useContext, useState, useEffect } from"react";
import { api } from"@/lib/api";
import { useAuth } from"@/contexts/auth-context";
import { useToast } from"@/hooks/use-toast"

export type Notification = {
 id: string;
 title: string;
 message: string;
 type:"INFO" |"WARNING" |"SUCCESS";
 isRead: boolean;
 createdAt: string;
};

interface NotificationContextType {
 notifications: Notification[];
 unreadCount: number;
 isLoading: boolean;
 fetchNotifications: () => Promise<void>;
 markAsRead: (id: string) => Promise<void>;
 markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
 notifications: [],
 unreadCount: 0,
 isLoading: false,
 fetchNotifications: async () => { },
 markAsRead: async () => { },
 markAllAsRead: async () => { },
});

export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
 const { isAuthenticated, user } = useAuth();
 const { toast } = useToast();
 const [notifications, setNotifications] = useState<Notification[]>([]);
 const [isLoading, setIsLoading] = useState(false);

 const fetchNotifications = async () => {
 if (!isAuthenticated) return;

 try {
 setIsLoading(true);
 const data = await api.get('/notifications');
 setNotifications(data);
 } catch (error) {
 // Error handling tailored for silent failures
 } finally {
 setIsLoading(false);
 }
 };

 const markAsRead = async (id: string) => {
 try {
 // Optimistic update
 setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));

 await api.put(`/notifications/${id}/read`, {});
 } catch (error) {
 fetchNotifications(); // Revert on failure
 }
 };

 const markAllAsRead = async () => {
 try {
 // Optimistic update
 setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

 await api.put('/notifications/read-all', {});
 } catch (error) {
 fetchNotifications(); // Revert on failure
 }
 };

 // Fetch notifications on mount and set up Realtime subscription
 useEffect(() => {
 if (!isAuthenticated || !user) {
 setNotifications([]);
 return;
 }

 fetchNotifications();

 // [MIGRATED] Supabase Realtime subscription removed.
 // TODO: Replace with Firebase Realtime listener or similar for live notifications.
 }, [isAuthenticated, user?.id]);

 const unreadCount = notifications.filter(n => !n.isRead).length;

 return (
 <NotificationContext.Provider value={{
 notifications,
 unreadCount,
 isLoading,
 fetchNotifications,
 markAsRead,
 markAllAsRead
 }}>
 {children}
 </NotificationContext.Provider>
 );
}
