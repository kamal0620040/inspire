import { create } from "zustand";

export interface UserMetadata {
  avatar_url?: string;
  picture?: string;
  full_name?: string;
  name?: string;
  email?: string;
  email_verified?: boolean;

  [key: string]: unknown;
}

export interface UserProfile {
  id: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  metadata: UserMetadata;
}

interface UserStore {
  user: UserProfile | null;

  initialized: boolean;
  loading: boolean;

  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  initialized: false,
  loading: false,

  setUser: (user) => set({ user }),

  setLoading: (loading) => set({ loading }),

  setInitialized: (initialized) => set({ initialized }),

  clearUser: () =>
    set({
      user: null,
      initialized: true,
      loading: false,
    }),
}));