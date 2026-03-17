"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ClientForm } from "./client-form";
import type { Client } from "@/types/database";

interface ClientSettingsLoaderProps {
  clientId: string;
}

export function ClientSettingsLoader({ clientId }: ClientSettingsLoaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClient() {
      const { data } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .single();

      if (!data) {
        router.push("/dashboard/clients");
        return;
      }

      setClient(data);
      setLoading(false);
    }
    fetchClient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  if (loading || !client) {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Edit {client.name}</h2>
        <p className="text-sm text-muted-foreground">
          Update the brand profile and response configuration.
        </p>
      </div>
      <ClientForm client={client} mode="edit" />
    </div>
  );
}
