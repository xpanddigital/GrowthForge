"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ClientContextState {
  selectedClientId: string | null;
  selectedClientName: string | null;
  _hasHydrated: boolean;
  setSelectedClient: (id: string | null, name: string | null) => void;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useClientContext = create<ClientContextState>()(
  persist(
    (set) => ({
      selectedClientId: null,
      selectedClientName: null,
      _hasHydrated: false,
      setSelectedClient: (id, name) =>
        set({ selectedClientId: id, selectedClientName: name }),
      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
    }),
    {
      name: "gf-client-context",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
