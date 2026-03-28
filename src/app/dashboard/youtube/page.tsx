"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, RefreshCw, ExternalLink, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useClientContext } from "@/hooks/use-client-context";

interface YouTubeTopic {
  id: string;
  topic: string;
  has_client_video: boolean;
  client_video_url: string | null;
  client_video_title: string | null;
  competitor_videos: Array<{
    competitor: string;
    title: string;
    url: string;
    views: number;
  }>;
  opportunity_score: number | null;
  video_brief: string | null;
}

interface Stats {
  totalTopics: number;
  withClientVideo: number;
  gapCount: number;
  presenceCoverage: number;
}

function getOpportunityColor(score: number): string {
  if (score >= 80) return "text-red-400";
  if (score >= 50) return "text-amber-400";
  return "text-emerald-400";
}

export default function YouTubeGeoPage() {
  useEffect(() => { document.title = "YouTube GEO — MentionLayer"; }, []);

  const { selectedClientId, selectedClientName } = useClientContext();
  const [topics, setTopics] = useState<YouTubeTopic[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  const fetchData = useCallback(async () => {
    if (!selectedClientId) {
      setTopics([]);
      setStats(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/youtube-geo/results?clientId=${selectedClientId}`
      );
      const json = await res.json();
      setTopics(json.data || []);
      setStats(json.stats || null);
    } catch {
      setTopics([]);
    } finally {
      setLoading(false);
    }
  }, [selectedClientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const triggerScan = async () => {
    if (!selectedClientId) return;
    setScanning(true);
    try {
      await fetch("/api/youtube-geo/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selectedClientId }),
      });
      setTimeout(() => fetchData(), 5000);
      setTimeout(() => fetchData(), 20000);
      setTimeout(() => fetchData(), 60000);
    } finally {
      setScanning(false);
    }
  };

  if (!selectedClientId) {
    return (
      <div className="p-6">
        <EmptyState
          icon={Video}
          title="Select a client"
          description="Choose a client to view their YouTube GEO data."
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">YouTube GEO</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Video presence audit and gap analysis for {selectedClientName}
          </p>
        </div>
        <Button
          onClick={triggerScan}
          disabled={scanning || loading}
          className="bg-[#6C5CE7] hover:bg-[#5A4BD1]"
        >
          {scanning ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Scan YouTube
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg bg-zinc-800" />
          ))}
        </div>
      ) : topics.length === 0 ? (
        <EmptyState
          icon={Video}
          title="No YouTube data yet"
          description="Run a YouTube GEO scan to discover video presence and gaps for your keywords."
          action={
            <Button
              onClick={triggerScan}
              className="bg-[#6C5CE7] hover:bg-[#5A4BD1]"
            >
              Run First Scan
            </Button>
          }
        />
      ) : (
        <>
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Topics</p>
                <p className="text-2xl font-bold text-zinc-100">{stats.totalTopics}</p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Client Videos</p>
                <p className="text-2xl font-bold text-emerald-400">{stats.withClientVideo}</p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Video Gaps</p>
                <p className="text-2xl font-bold text-amber-400">{stats.gapCount}</p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Coverage</p>
                <p className="text-2xl font-bold text-zinc-100">{stats.presenceCoverage}%</p>
              </div>
            </div>
          )}

          {/* Topic list */}
          <div className="space-y-3">
            {topics.map((topic) => (
              <div
                key={topic.id}
                className="rounded-lg border border-zinc-800 bg-zinc-900 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-sm font-medium text-zinc-200">
                        {topic.topic}
                      </h3>
                      {topic.has_client_video ? (
                        <Badge className="bg-emerald-900/50 text-emerald-400 border-emerald-800">
                          Has Video
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-900/50 text-amber-400 border-amber-800">
                          Gap
                        </Badge>
                      )}
                    </div>

                    {topic.client_video_url && (
                      <a
                        href={topic.client_video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-zinc-400 hover:text-zinc-300 flex items-center gap-1 mb-2"
                      >
                        <Video className="h-3 w-3" />
                        {topic.client_video_title || "Client video"}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}

                    {topic.competitor_videos.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-zinc-500 mb-1">
                          Competitor videos:
                        </p>
                        <div className="space-y-1">
                          {topic.competitor_videos.map((v, i) => (
                            <a
                              key={i}
                              href={v.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-zinc-400 hover:text-zinc-300 flex items-center gap-1"
                            >
                              <span className="text-amber-400">
                                {v.competitor}
                              </span>
                              : {v.title}
                              {v.views > 0 && (
                                <span className="text-zinc-600">
                                  ({v.views.toLocaleString()} views)
                                </span>
                              )}
                              <ExternalLink className="h-3 w-3 flex-shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {topic.opportunity_score !== null && (
                    <div className="text-right ml-4">
                      <span
                        className={`text-lg font-bold ${getOpportunityColor(topic.opportunity_score)}`}
                      >
                        {topic.opportunity_score}
                      </span>
                      <p className="text-xs text-zinc-500">opportunity</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
