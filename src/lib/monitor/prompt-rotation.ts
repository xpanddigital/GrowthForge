// Prompt Rotation — selects a subset of generated prompts for each monitoring run.
// Prioritizes least-recently-used to ensure all variations get tested over time.
// Over 4 weeks, all 5 variations get tested (3 per run × 4 runs = 12, covering all 5).

export interface RotatablePrompt {
  text: string;
  type: string;
  last_used_at: string | null;
}

/**
 * Select prompts for the current monitoring run using LRU strategy.
 * Never-used prompts get highest priority. After that, oldest-used first.
 *
 * @param allPrompts - All available prompt variations
 * @param selectCount - How many to select for this run (default 3)
 * @returns Selected prompts for this run
 */
export function selectPromptsForRun(
  allPrompts: RotatablePrompt[],
  selectCount: number = 3
): RotatablePrompt[] {
  if (allPrompts.length <= selectCount) {
    return [...allPrompts];
  }

  // Sort by least recently used first (never used = highest priority)
  const sorted = [...allPrompts].sort((a, b) => {
    if (!a.last_used_at) return -1;
    if (!b.last_used_at) return 1;
    return (
      new Date(a.last_used_at).getTime() - new Date(b.last_used_at).getTime()
    );
  });

  return sorted.slice(0, selectCount);
}
