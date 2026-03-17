import { createHash } from "crypto";

function stripQueryParams(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
  } catch {
    return url;
  }
}

export function generateContentHash(title: string, url: string): string {
  const normalized = `${title.toLowerCase().trim()}|${stripQueryParams(url).toLowerCase()}`;
  return createHash("sha256").update(normalized).digest("hex");
}
