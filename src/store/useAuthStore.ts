import { create } from "zustand";
import { User } from "../types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  loginWithGoogle: (customEmail?: string, customName?: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const DEFAULT_DEMO_USER: User = {
  id: "user_google_98234",
  name: "Alex Rivera",
  email: "alex.rivera@gmail.com",
  image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
};

export const useAuthStore = create<AuthState>((set) => ({
  user: DEFAULT_DEMO_USER,
  isLoading: false,

  loginWithGoogle: async (customEmail?: string, customName?: string) => {
    set({ isLoading: true });
    try {
      // In production with NextAuth, this triggers Google OAuth.
      // In this environment, we sync with the backend session API.
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: customEmail || "alex.rivera@gmail.com",
          name: customName || "Alex Rivera",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        set({ user: data.user, isLoading: false });
      } else {
        set({
          user: {
            id: `user_${Date.now()}`,
            name: customName || "Creator",
            email: customEmail || "creator@gmail.com",
            image: null,
          },
          isLoading: false,
        });
      }
    } catch {
      set({
        user: DEFAULT_DEMO_USER,
        isLoading: false,
      });
    }
  },

  logout: async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } catch (e) {
      console.warn("Signout error:", e);
    }
    set({ user: null });
  },

  setUser: (user) => set({ user }),
}));
