"use client";

import { useEffect, useState, useCallback } from "react";
import { FileText, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useClientContext } from "@/hooks/use-client-context";

interface VideoBrief {
  suggestedTitle: string;
  outline: string[];
  keyPoints: string[];
  seoTags: string[];
  descriptionTemplate: string;
  estimatedLength: string;
  competitorContext: string;
}

interface YouTubeTopic {
  id: string;
  topic: string;
  has_client_video: boolean;
  opportunity_score: number | null;
  video_brief: string | null;
}

export default function VideoBriefsPage() {
  useEffect(() => { document.title = "YouTube GEO — MentionLayer"; }, []);

  const { selectedClientId } = useClientContext();
  const [topics, setTopics] = useState<YouTubeTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!selectedClientId) {
      setTopics([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/youtube-geo/results?clientId=${selectedClientId}`
      );
      const json = await res.json();
      // Only show topics with briefs
      const withBriefs = (json.data || []).filter(
        (t: YouTubeTopic) => t.video_brief && !t.has_client_video
      );
      setTopics(withBriefs);
    } catch {
      setTopics([]);
    } finally {
      setLoading(false);
    }
  }, [selectedClientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const parseBrief = (briefJson: string): VideoBrief | null => {
    try {
      return JSON.parse(briefJson);
    } catch {
      return null;
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Video Briefs</h1>
        <p className="text-sm text-zinc-400 mt-1">
          AI-generated video content briefs for topics where you have no
          YouTube presence
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg bg-zinc-800" />
          ))}
        </div>
      ) : topics.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No video briefs yet"
          description="Run a YouTube GEO scan to generate video content briefs for topics where competitors have videos but you don't."
        />
      ) : (
        <div className="space-y-6">
          {topics.map((topic) => {
            const brief = topic.video_brief
              ? parseBrief(topic.video_brief)
              : null;
            if (!brief) return null;

            return (
              <div
                key={topic.id}
                className="rounded-lg border border-zinc-800 bg-zinc-900 p-6"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                      Topic: {topic.topic}
                    </p>
                    <h3 className="text-lg font-semibold text-zinc-100">
                      {brief.suggestedTitle}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-zinc-500">
                        {brief.estimatedLength}
                      </Badge>
                      {topic.opportunity_score && (
                        <Badge className="bg-amber-900/50 text-amber-400 border-amber-800">
                          Opportunity: {topic.opportunity_score}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        JSON.stringify(brief, null, 2),
                        topic.id
                      )
                    }
                  >
                    {copiedId === topic.id ? (
                      <Check className="h-4 w-4 mr-1 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1" />
                    )}
                    {copiedId === topic.id ? "Copied" : "Copy Brief"}
                  </Button>
                </div>

                {/* Competitor context */}
                {brief.competitorContext && (
                  <div className="bg-amber-900/10 border border-amber-900/30 rounded-lg p-3 mb-4">
                    <p className="text-xs text-amber-400 font-medium mb-1">
                      Competitive Context
                    </p>
                    <p className="text-sm text-zinc-300">
                      {brief.competitorContext}
                    </p>
                  </div>
                )}

                {/* Outline */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-zinc-300 mb-2">
                    Video Outline
                  </h4>
                  <ol className="space-y-1">
                    {brief.outline.map((section, i) => (
                      <li
                        key={i}
                        className="text-sm text-zinc-400 flex items-start gap-2"
                      >
                        <span className="text-zinc-600 font-mono text-xs mt-0.5">
                          {i + 1}.
                        </span>
                        {section}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Key Points */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-zinc-300 mb-2">
                    Key Points to Cover
                  </h4>
                  <ul className="space-y-1">
                    {brief.keyPoints.map((point, i) => (
                      <li
                        key={i}
                        className="text-sm text-zinc-400 flex items-start gap-2"
                      >
                        <span className="text-[#6C5CE7] mt-0.5">+</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* SEO Tags */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-zinc-300 mb-2">
                    SEO Tags
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {brief.seoTags.map((tag, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="text-zinc-500 text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Description Template */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-zinc-300">
                      Description Template
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          brief.descriptionTemplate,
                          `${topic.id}-desc`
                        )
                      }
                    >
                      {copiedId === `${topic.id}-desc` ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <pre className="text-xs text-zinc-400 bg-zinc-800 rounded-lg p-3 whitespace-pre-wrap font-mono">
                    {brief.descriptionTemplate}
                  </pre>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
