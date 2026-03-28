"use client";

import { useEffect, useState } from "react";
import { Newspaper, Loader2, Copy, Check, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { useClientContext } from "@/hooks/use-client-context";

interface NewsroomResult {
  html: string;
  jsonLdSchema: string;
  metadata: {
    title: string;
    description: string;
    releaseCount: number;
    coverageCount: number;
  };
}

export default function NewsroomPage() {
  useEffect(() => { document.title = "PressForge — MentionLayer"; }, []);

  const { selectedClientId, selectedClientName } = useClientContext();
  const [result, setResult] = useState<NewsroomResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);

  const generatePage = async () => {
    if (!selectedClientId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/press/newsroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selectedClientId }),
      });
      const json = await res.json();
      if (json.data) {
        setResult(json.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!selectedClientId) {
    return (
      <div className="p-6">
        <EmptyState
          icon={Newspaper}
          title="Select a client"
          description="Choose a client to generate their newsroom page."
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Newsroom Generator</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Generate a /newsroom page for {selectedClientName} with Organization
            schema — 18% of ChatGPT citations come from brand newsrooms
          </p>
        </div>
        <Button
          onClick={generatePage}
          disabled={loading}
          className="bg-[#6C5CE7] hover:bg-[#5A4BD1]"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Newspaper className="h-4 w-4 mr-2" />
          )}
          Generate Newsroom
        </Button>
      </div>

      {result && (
        <>
          {/* Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <p className="text-xs text-zinc-500 uppercase">Title</p>
              <p className="text-sm text-zinc-200">{result.metadata.title}</p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <p className="text-xs text-zinc-500 uppercase">Releases</p>
              <p className="text-2xl font-bold text-zinc-100">
                {result.metadata.releaseCount}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <p className="text-xs text-zinc-500 uppercase">Coverage</p>
              <p className="text-2xl font-bold text-zinc-100">
                {result.metadata.coverageCount}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(result.html, "html")}
              >
                {copied === "html" ? (
                  <Check className="h-4 w-4 mr-1 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4 mr-1" />
                )}
                Copy HTML
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  copyToClipboard(result.jsonLdSchema, "schema")
                }
              >
                {copied === "schema" ? (
                  <Check className="h-4 w-4 mr-1 text-emerald-400" />
                ) : (
                  <Code className="h-4 w-4 mr-1" />
                )}
                Copy Schema
              </Button>
            </div>
          </div>

          {/* Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={showPreview ? "default" : "outline"}
              size="sm"
              onClick={() => setShowPreview(true)}
              className={showPreview ? "bg-[#6C5CE7]" : ""}
            >
              Preview
            </Button>
            <Button
              variant={!showPreview ? "default" : "outline"}
              size="sm"
              onClick={() => setShowPreview(false)}
              className={!showPreview ? "bg-[#6C5CE7]" : ""}
            >
              HTML Source
            </Button>
          </div>

          {/* Content */}
          {showPreview ? (
            <div className="rounded-lg border border-zinc-800 bg-white overflow-hidden">
              <iframe
                srcDoc={result.html}
                className="w-full h-[600px] border-0"
                title="Newsroom Preview"
                sandbox="allow-same-origin"
              />
            </div>
          ) : (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
              <pre className="p-4 text-xs text-zinc-400 overflow-auto max-h-[600px] font-mono">
                {result.html}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}
