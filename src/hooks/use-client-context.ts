"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ClientContextState {
  selectedClientId: string | null;
  selectedClientName: string | null;
  setSelectedClient: (id: string | null, name: string | null) => void;
}

export const useClientContext = create<ClientContextState>()(
  persist(
    (set) => ({
      selectedClientId: null,
      selectedClientName: null,
      setSelectedClient: (id, name) =>
        set({ selectedClientId: id, selectedClientName: name }),
    }),
    {
      name: "gf-client-context",
    }
  )
);
