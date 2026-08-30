"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { SignOutAnimationOverlay } from "@/components/ui/signout-animation-overlay";
import { cn } from "@/lib/utils";

type User = {
  id: string;
  email: string;
  role: "STUDENT" | "ADMIN" | "TRAINER" | "RECRUITER";
  name?: string;
  photoUrl?: string;
  mustChangePassword?: boolean;
};

type AuthContextType = {
  user: User | null;
  login: (user: User) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<User | null>;
  updateUser: (user: Partial<User>) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingOut: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const refreshSession = async () => {
    try {
      const userData = await api.get("/auth/me", { skipRedirect: true });
      setUser(userData);
      return userData;
    } catch {
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshSession();
  }, []);

  const login = (nextUser: User) => {
    setUser(nextUser);
    setIsLoading(false);
  };

  const updateUser = (updatedFields: Partial<User>) => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser;
      return { ...currentUser, ...updatedFields };
    });
  };

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await api.post("/auth/logout", {}, { skipRedirect: true });
    } catch {
      // Ignore logout failures and continue clearing client state.
    }

    // Smooth delay for sign out animation before top-level navigation
    await new Promise((r) => setTimeout(r, 600));
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        refreshSession,
        updateUser,
        isAuthenticated: !!user,
        isLoading,
        isLoggingOut,
      }}
    >
      <SignOutAnimationOverlay visible={isLoggingOut} />
      <div className={cn("transition-all duration-300", isLoggingOut && "filter blur-md opacity-40 pointer-events-none select-none")}>
        {children}
      </div>
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
