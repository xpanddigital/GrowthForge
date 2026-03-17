"use client";

import { CopyButton } from "@/components/citations/copy-button";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export function CodeBlock({ code, language, title }: CodeBlockProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-zinc-900">
      {/* Title bar */}
      {(title || language) && (
        <div className="flex items-center justify-between border-b border-zinc-700 px-4 py-2">
          <span className="text-xs font-medium text-zinc-400">
            {title ?? language}
          </span>
          <CopyButton text={code} />
        </div>
      )}
      {/* Code content */}
      <div className="relative">
        {!title && !language && (
          <div className="absolute right-2 top-2">
            <CopyButton text={code} />
          </div>
        )}
        <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
          <code className="font-mono text-zinc-100">{code}</code>
        </pre>
      </div>
    </div>
  );
}
