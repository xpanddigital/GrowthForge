"use client";

import { useEffect, useState } from "react";
import { useClientContext } from "@/hooks/use-client-context";
import { createClient } from "@/lib/supabase/client";
import type { Client } from "@/types/database";
import { Building2, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function ClientSelector() {
  const { selectedClientId, selectedClientName, setSelectedClient, _hasHydrated } =
    useClientContext();
  const [clients, setClients] = useState<Client[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!_hasHydrated) return; // Wait for localStorage to load before deciding
    async function fetchClients() {
      const { data } = await supabase
        .from("clients")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (data) {
        setClients(data);
        // Auto-select first client only if nothing was persisted
        if (!selectedClientId && data.length > 0) {
          setSelectedClient(data[0].id, data[0].name);
        }
      }
      setLoading(false);
    }
    fetchClients();

    // Re-fetch when dropdown opens (catches newly added clients)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hasHydrated]);

  // Refresh client list every time dropdown opens
  useEffect(() => {
    if (!open) return;
    async function refreshClients() {
      const { data } = await supabase
        .from("clients")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (data) setClients(data);
    }
    refreshClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (loading) {
    return (
      <div className="flex h-9 w-48 animate-pulse items-center rounded-md bg-muted" />
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 py-1 text-sm hover:bg-accent"
      >
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="max-w-[150px] truncate">
          {selectedClientName || "All Clients"}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-md border border-border bg-popover py-1 shadow-lg">
            <button
              onClick={() => {
                setSelectedClient(null, null);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent",
                !selectedClientId && "text-primary"
              )}
            >
              {!selectedClientId && <Check className="h-3.5 w-3.5" />}
              <span className={cn(!selectedClientId ? "ml-0" : "ml-5")}>
                All Clients
              </span>
            </button>
            <div className="my-1 border-t border-border" />
            {clients.map((client) => (
              <button
                key={client.id}
                onClick={() => {
                  setSelectedClient(client.id, client.name);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent",
                  selectedClientId === client.id && "text-primary"
                )}
              >
                {selectedClientId === client.id && (
                  <Check className="h-3.5 w-3.5" />
                )}
                <span
                  className={cn(
                    selectedClientId === client.id ? "ml-0" : "ml-5"
                  )}
                >
                  {client.name}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
