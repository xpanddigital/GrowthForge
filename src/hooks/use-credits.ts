"use client";

import { create } from "zustand";

interface CreditsState {
  balance: number;
  setBalance: (balance: number) => void;
}

export const useCredits = create<CreditsState>()((set) => ({
  balance: 999999,
  setBalance: (balance) => set({ balance }),
}));
