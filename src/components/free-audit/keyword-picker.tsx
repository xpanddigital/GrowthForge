"use client";

import { useState, useEffect } from "react";

interface KeywordPickerProps {
  websiteUrl: string;
  companyName: string;
  selectedKeywords: string[];
  onKeywordsChange: (keywords: string[]) => void;
}

export function KeywordPicker({
  websiteUrl,
  companyName,
  selectedKeywords,
  onKeywordsChange,
}: KeywordPickerProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [customKeyword, setCustomKeyword] = useState("");

  useEffect(() => {
    if (!websiteUrl || !companyName) return;

    setLoading(true);
    fetch("/api/free-audit/suggest-keywords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ websiteUrl, companyName }),
    })
      .then((res) => res.json())
      .then((data) => {
        const kw = data.data?.keywords || [];
        setSuggestions(kw);
        // Auto-select all suggestions
        onKeywordsChange(kw);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [websiteUrl, companyName]);

  function toggleKeyword(keyword: string) {
    if (selectedKeywords.includes(keyword)) {
      onKeywordsChange(selectedKeywords.filter((k) => k !== keyword));
    } else {
      onKeywordsChange([...selectedKeywords, keyword]);
    }
  }

  function addCustomKeyword() {
    const kw = customKeyword.trim();
    if (!kw || selectedKeywords.includes(kw)) return;
    onKeywordsChange([...selectedKeywords, kw]);
    if (!suggestions.includes(kw)) {
      setSuggestions((prev) => [...prev, kw]);
    }
    setCustomKeyword("");
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Generating keyword suggestions...
          </p>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-8 w-32 animate-pulse rounded-full bg-muted"
              />
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((kw) => {
              const isSelected = selectedKeywords.includes(kw);
              return (
                <button
                  key={kw}
                  type="button"
                  onClick={() => toggleKeyword(kw)}
                  className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm transition-colors ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {kw}
                  {isSelected && (
                    <svg
                      className="ml-1.5 h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add a custom keyword..."
              value={customKeyword}
              onChange={(e) => setCustomKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomKeyword();
                }
              }}
              className="flex h-9 flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="button"
              onClick={addCustomKeyword}
              disabled={!customKeyword.trim()}
              className="inline-flex h-9 items-center rounded-md bg-muted px-3 text-sm font-medium hover:bg-muted/80 disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </>
      )}

      <p className="text-xs text-muted-foreground">
        {selectedKeywords.length} selected
        {selectedKeywords.length < 3 && " (minimum 3 required)"}
      </p>
    </div>
  );
}
