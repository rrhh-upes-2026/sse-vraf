import { create } from "zustand";

interface EditAuthState {
  isAuthenticated: boolean;
  setAuthenticated: (val: boolean) => void;
}

export const useEditAuthStore = create<EditAuthState>((set) => ({
  isAuthenticated: false,
  setAuthenticated: (val) => set({ isAuthenticated: val }),
}));
