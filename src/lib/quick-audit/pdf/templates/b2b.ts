// B2B tier PDF template — 4-5 pages, clean professional.
// Used for targeted cold outreach to businesses.

import { BASE_STYLES, BRAND_COLORS } from "../styles";
import { getGrade } from "../../scoring";
import type { QuickAuditResult } from "../../types";

export function renderB2BTemplate(result: QuickAuditResult): string {
  const grade = getGrade(result.score);
  const date = new Date(result.generatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const topCompetitors = Object.entries(result.competitorMentions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const topCompetitorCount = topCompetitors[0]?.[1] || 0;

  // Pick 2-3 evidence examples (tests where competitor was mentioned but brand wasn't)
  const evidenceExamples = result.aiTests
    .filter((t) => !t.brandMentioned && t.competitorsMentioned.length > 0)
    .slice(0, 3);

  // Forum threads where competitors appear
  const competitorThreads = result.forumChecks
    .flatMap((c) => c.topThreads)
    .filter((t) => t.hasCompetitor && !t.hasBrand)
    .slice(0, 5);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>${BASE_STYLES}</style>
</head>
<body>

<!-- PAGE 1: COVER -->
<div class="page cover">
  <h1>AI Visibility Audit</h1>
  <div class="subtitle">How AI Models See Your Brand</div>
  <div style="margin-top: 40px;">
    <div class="business-name">${esc(result.input.businessName)}</div>
    <div style="color: ${BRAND_COLORS.muted}; font-size: 14px;">${esc(result.enrichment.industry)} &bull; ${esc(result.enrichment.location)}</div>
  </div>
  <div class="date">Prepared on ${date}</div>
  <div class="brand-tag">Powered by MentionLayer &mdash; mentionlayer.com</div>
</div>

<!-- PAGE 2: SCORECARD -->
<div class="page">
  <div class="score-section">
    <div class="score-ring" style="border-color: ${grade.color};">
      <div class="number" style="color: ${grade.color};">${result.score}</div>
      <div class="out-of">/100</div>
    </div>
    <div class="score-label" style="color: ${grade.color};">AI Visibility: ${grade.label}</div>
    <div class="score-sublabel">
      ${result.score <= 20
        ? `When people ask AI for ${esc(result.enrichment.industry)} recommendations, your business is invisible.`
        : result.score <= 50
        ? `Your business has some AI visibility, but competitors are significantly ahead.`
        : `Your business has decent AI visibility, with room for improvement.`
      }
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-value" style="color: ${result.aiMentionCount > 0 ? BRAND_COLORS.success : BRAND_COLORS.danger};">
        ${result.aiMentionCount}/${result.aiTotalTests}
      </div>
      <div class="stat-label">AI Mentions</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" style="color: ${result.forumBrandPresent > 0 ? BRAND_COLORS.success : BRAND_COLORS.danger};">
        ${result.forumBrandPresent}/${result.forumTotalThreads}
      </div>
      <div class="stat-label">Forum Threads</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" style="color: ${topCompetitorCount > 0 ? BRAND_COLORS.warning : BRAND_COLORS.success};">
        ${topCompetitors.length}
      </div>
      <div class="stat-label">Competitors Ahead</div>
    </div>
  </div>

  ${topCompetitors.length > 0 ? `
  <h2>Competitor Visibility Comparison</h2>
  <div class="bar-chart">
    ${topCompetitors.map(([name, count]) => `
    <div class="bar-row">
      <div class="bar-label">${esc(name)}</div>
      <div class="bar-track">
        <div class="bar-fill" style="width: ${Math.min(count / Math.max(result.aiTotalTests, 1) * 100, 100)}%; background: ${BRAND_COLORS.primary};">
          ${count}x
        </div>
      </div>
    </div>`).join("")}
    <div class="bar-row">
      <div class="bar-label" style="font-weight: 700; color: ${BRAND_COLORS.danger};">${esc(result.input.businessName)}</div>
      <div class="bar-track">
        <div class="bar-fill" style="width: ${Math.max(result.aiMentionCount / Math.max(result.aiTotalTests, 1) * 100, 3)}%; background: ${BRAND_COLORS.danger};">
          ${result.aiMentionCount}x
        </div>
      </div>
    </div>
  </div>
  ` : ""}

  <div class="page-footer">
    <span>${esc(result.input.businessName)} &mdash; AI Visibility Audit</span>
    <span>Page 2</span>
  </div>
</div>

<!-- PAGE 3: EVIDENCE -->
<div class="page">
  <h2>The Evidence</h2>
  <p style="color: ${BRAND_COLORS.muted}; margin-bottom: 16px;">
    We asked AI models buying-intent questions about your industry.
    Here&rsquo;s what they said:
  </p>

  ${evidenceExamples.map((test) => {
    // Truncate response to ~200 chars for the PDF
    const truncated = test.responseText.length > 250
      ? test.responseText.slice(0, 250) + "..."
      : test.responseText;
    // Highlight competitor names
    let highlighted = esc(truncated);
    for (const comp of test.competitorsMentioned) {
      highlighted = highlighted.replace(
        new RegExp(escapeRegex(comp), "gi"),
        `<span class="competitor-highlight">${esc(comp)}</span>`
      );
    }
    return `
    <div class="evidence-box danger">
      <div class="evidence-prompt">${esc(test.model)} &mdash; &ldquo;${esc(test.prompt)}&rdquo;</div>
      <div class="evidence-text">${highlighted}</div>
      <div class="evidence-verdict not-mentioned">
        &#10007; ${esc(result.input.businessName)} was NOT mentioned
        ${test.competitorsMentioned.length > 0
          ? ` &mdash; ${test.competitorsMentioned.map(esc).join(", ")} ${test.competitorsMentioned.length === 1 ? "was" : "were"} mentioned instead`
          : ""}
      </div>
    </div>`;
  }).join("")}

  ${competitorThreads.length > 0 ? `
  <h2>Forum Threads Where Competitors Appear</h2>
  <p style="color: ${BRAND_COLORS.muted}; margin-bottom: 12px; font-size: 13px;">
    These threads rank in Google and are referenced by AI models.
    Your competitors are present. You are not.
  </p>
  ${competitorThreads.slice(0, 4).map((thread) => `
  <div class="evidence-box danger">
    <div class="evidence-prompt">${esc(thread.title)}</div>
    <div class="evidence-text" style="font-size: 12px;">${esc(thread.snippet.slice(0, 150))}</div>
    <div class="evidence-verdict not-mentioned">
      &#10007; ${esc(result.input.businessName)} absent &mdash; ${esc(thread.hasCompetitor || "")} present
    </div>
  </div>`).join("")}
  ` : ""}

  ${result.executiveSummary ? `
  <h2>Analysis</h2>
  <p style="font-size: 13px; line-height: 1.7;">${esc(result.executiveSummary)}</p>
  ` : ""}

  <div class="page-footer">
    <span>${esc(result.input.businessName)} &mdash; AI Visibility Audit</span>
    <span>Page 3</span>
  </div>
</div>

<!-- PAGE 4: CTA -->
<div class="page cta-page">
  <h2>How to Fix This</h2>
  <p style="color: #CBD5E1; margin-bottom: 32px; font-size: 15px;">
    Your AI visibility score of ${result.score}/100 means AI models are directing potential customers to your competitors.
    Here&rsquo;s what needs to happen:
  </p>

  <div class="cta-step">
    <div class="cta-step-num">1</div>
    <div class="cta-step-text">
      <h3>Seed High-Authority Threads</h3>
      <p>Place authentic brand mentions in the Reddit and Quora threads that AI models reference when answering questions about your industry.</p>
    </div>
  </div>

  <div class="cta-step">
    <div class="cta-step-num">2</div>
    <div class="cta-step-text">
      <h3>Fix Your Entity Signals</h3>
      <p>Ensure your brand information is consistent across every platform AI crawls &mdash; directories, review sites, social profiles, and your own website schema.</p>
    </div>
  </div>

  <div class="cta-step">
    <div class="cta-step-num">3</div>
    <div class="cta-step-text">
      <h3>Monitor &amp; Measure</h3>
      <p>Track your AI visibility monthly. Measure share-of-model across ChatGPT, Perplexity, Gemini, and Claude to prove ROI.</p>
    </div>
  </div>

  <div style="text-align: center; margin-top: 40px;">
    <div class="cta-button">Book a Free 15-Minute AI Visibility Strategy Call</div>
    <div class="cta-contact">
      <br>
      Joel House &bull; joel@mentionlayer.com
      <br>
      mentionlayer.com
    </div>
  </div>

  <div class="page-footer" style="color: #475569;">
    <span>Powered by MentionLayer</span>
    <span>Page 4</span>
  </div>
</div>

</body>
</html>`;
}

// HTML escaping
function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
