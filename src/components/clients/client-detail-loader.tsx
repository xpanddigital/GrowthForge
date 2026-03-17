"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ClientDetail } from "./client-detail";
import type { Client, Keyword } from "@/types/database";

interface ClientDetailLoaderProps {
  clientId: string;
}

export function ClientDetailLoader({ clientId }: ClientDetailLoaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const [client, setClient] = useState<Client | null>(null);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [clientResult, keywordsResult] = await Promise.all([
        supabase.from("clients").select("*").eq("id", clientId).single(),
        supabase
          .from("keywords")
          .select("*")
          .eq("client_id", clientId)
          .order("created_at", { ascending: false }),
      ]);

      if (!clientResult.data) {
        router.push("/dashboard/clients");
        return;
      }

      setClient(clientResult.data);
      setKeywords(keywordsResult.data || []);
      setLoading(false);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  if (loading || !client) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-40 animate-pulse rounded-lg border border-border bg-card" />
          <div className="h-40 animate-pulse rounded-lg border border-border bg-card" />
        </div>
      </div>
    );
  }

  return (
    <ClientDetail client={client} keywords={keywords} maxKeywords={100} />
  );
}
