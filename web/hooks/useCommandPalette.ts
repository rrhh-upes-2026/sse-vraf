"use client";

import { create } from "zustand";

interface CommandPaletteStore {
  isOpen: boolean;
  query: string;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setQuery: (q: string) => void;
}

export const useCommandPaletteStore = create<CommandPaletteStore>((set) => ({
  isOpen: false,
  query: "",
  open:    () => set({ isOpen: true, query: "" }),
  close:   () => set({ isOpen: false, query: "" }),
  toggle:  () => set((s) => ({ isOpen: !s.isOpen, query: "" })),
  setQuery:(q) => set({ query: q }),
}));
