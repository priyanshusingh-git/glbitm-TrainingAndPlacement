"use client";

import { createContext, useContext, useEffect, useState, useRef } from"react";
import { useRouter } from"next/navigation";
import { api } from"@/lib/api";
import { auth } from"@/lib/firebase";
import { onIdTokenChanged, signOut, User as FirebaseUser } from"firebase/auth";

type User = {
 id: string;
 email: string;
 role:"STUDENT" |"ADMIN" |"STAFF" |"TRAINER";
 name?: string;
 photoUrl?: string;
 mustChangePassword?: boolean;
};

type AuthContextType = {
 user: User | null;
 token: string | null;
 login: (token: string, user: User) => void;
 logout: () => void;
 updateUser: (user: Partial<User>) => void;
 isAuthenticated: boolean;
 isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
 const [user, setUser] = useState<User | null>(null);
 const [token, setToken] = useState<string | null>(null);
 const [isLoading, setIsLoading] = useState(true);
 const handlingSessionRef = useRef<string | null>(null);
 const router = useRouter();

 useEffect(() => {
 // Firebase onIdTokenChanged handles initial session and subsequent changes
 const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
 console.log("Firebase Auth State Changed:", firebaseUser?.email);

 try {
 if (firebaseUser) {
 const idToken = await firebaseUser.getIdToken();
 await handleSession(idToken);
 } else {
 handleLogout();
 }
 } catch (err: any) {
 console.error("Firebase auth error:", err);
 setIsLoading(false);
 }
 });

 return () => unsubscribe();
 }, []);

 const handleSession = async (idToken: string) => {
 // Prevent overlapping session handling for the SAME token
 if (handlingSessionRef.current === idToken) {
 return;
 }

 // If we already have the profile for this token, skip
 if (token === idToken && user) {
 setIsLoading(false);
 return;
 }

 handlingSessionRef.current = idToken;

 try {
 // Fetch detailed user info from backend
 // Note: The backend will now need to verify Firebase Token
 const userData = await api.get("/auth/me", { token: idToken, skipRedirect: true });

 setToken(idToken);
 setUser(userData);
 sessionStorage.setItem("token", idToken);
 sessionStorage.setItem("user", JSON.stringify(userData));

 // Sync to cookies for middleware redirection
 const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
 document.cookie = `fb-token=${idToken}; path=/; expires=${expires}; SameSite=Lax`;
 document.cookie = `fb-user-role=${userData.role}; path=/; expires=${expires}; SameSite=Lax`;
 } catch (error: any) {
 if (error.message?.includes("Session expired") || error.status === 401) {
 console.warn("Session expired or invalid token. Redirecting...");
 await logout();
 } else {
 console.error("Failed to fetch user profile:", error);
 }
 } finally {
 handlingSessionRef.current = null;
 setIsLoading(false);
 }
 };

 const handleLogout = () => {
 setToken(null);
 setUser(null);
 sessionStorage.removeItem("token");
 sessionStorage.removeItem("user");

 // Clear cookies
 document.cookie ="fb-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
 document.cookie ="fb-user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

 setIsLoading(false);
 };

 const login = async (newToken: string, newUser: User) => {
 setToken(newToken);
 setUser(newUser);
 sessionStorage.setItem("token", newToken);
 sessionStorage.setItem("user", JSON.stringify(newUser));
 };

 const updateUser = (updatedFields: Partial<User>) => {
 if (!user) return;
 const newUser = { ...user, ...updatedFields };
 setUser(newUser);
 sessionStorage.setItem("user", JSON.stringify(newUser));
 };

 const logout = async () => {
 await signOut(auth);
 handleLogout();
 router.replace("/login");
 };

 return (
 <AuthContext.Provider
 value={{
 user,
 token,
 login,
 logout,
 updateUser,
 isAuthenticated: !!token && !!user,
 isLoading,
 }}
 >
 {children}
 </AuthContext.Provider>
 );
}

export function useAuth() {
 const context = useContext(AuthContext);
 if (context === undefined) {
 throw new Error("useAuth must be used within an AuthProvider");
 }
 return context;
}
