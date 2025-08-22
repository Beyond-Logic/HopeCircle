"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService } from "@/lib/supabase/service/auth-service";
import { User } from "@supabase/supabase-js";
import { UserProfile } from "@/types/user";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  refreshUser: () => Promise<{ user: User | null; profile: UserProfile | null }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const refreshUser = async () => {
    const { user: currentUser, profile: currentProfile } =
      await authService.getCurrentUser();
    setUser(currentUser);
    setProfile(currentProfile);
    return { user: currentUser, profile: currentProfile };
  };

  useEffect(() => {
    refreshUser(); // fetch current user once on mount
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
