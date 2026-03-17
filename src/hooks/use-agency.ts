"use client";

import { create } from "zustand";
import type { Agency, User } from "@/types/database";

interface AgencyState {
  agency: Agency | null;
  user: User | null;
  setAgency: (agency: Agency | null) => void;
  setUser: (user: User | null) => void;
}

export const useAgency = create<AgencyState>()((set) => ({
  agency: null,
  user: null,
  setAgency: (agency) => set({ agency }),
  setUser: (user) => set({ user }),
}));
