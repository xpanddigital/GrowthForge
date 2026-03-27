// Transactional email notifications for MentionLayer.
// Uses Resend for delivery. All emails use a consistent branded template.

import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("RESEND_API_KEY not set");
    _resend = new Resend(apiKey);
  }
  return _resend;
}

const FROM = "MentionLayer <notifications@mentionlayer.com>";

function wrap(title: string, body: string): string {
  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1E293B; background: #ffffff;">
  <div style="padding: 24px 24px 16px; border-bottom: 1px solid #E2E8F0;">
    <span style="font-size: 18px; font-weight: 700; color: #6C5CE7;">Mention</span><span style="font-size: 18px; font-weight: 700;">Layer</span>
  </div>
  <div style="padding: 24px;">
    <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 16px;">${title}</h2>
    ${body}
  </div>
  <div style="padding: 16px 24px; border-top: 1px solid #E2E8F0; color: #94A3B8; font-size: 12px;">
    MentionLayer — AI Visibility Platform<br>
    <a href="https://mentionlayer.com" style="color: #6C5CE7;">mentionlayer.com</a>
  </div>
</div>`;
}

/**
 * Send a welcome email when a new user signs up.
 */
export async function sendWelcomeEmail(to: string, name?: string): Promise<void> {
  const resend = getResend();
  const greeting = name ? `Hi ${name}` : "Hi there";

  await resend.emails.send({
    from: FROM,
    to,
    subject: "Welcome to MentionLayer",
    html: wrap(
      "Welcome to MentionLayer!",
      `<p>${greeting},</p>
       <p>Thanks for signing up. We're running your free AI Visibility Audit now — you'll get your results in a few minutes.</p>
       <p>Your audit will show:</p>
       <ul style="color: #475569; line-height: 1.8;">
         <li>How visible your brand is to ChatGPT, Perplexity, Gemini & Claude</li>
         <li>Which competitors AI models recommend instead of you</li>
         <li>A prioritized action plan to improve your AI visibility</li>
       </ul>
       <p style="margin-top: 24px;">
         <a href="https://mentionlayer.com/dashboard" style="display: inline-block; padding: 10px 24px; background: #6C5CE7; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">View Your Dashboard</a>
       </p>`
    ),
  });
}

/**
 * Send an email when a free audit completes.
 */
export async function sendAuditCompleteEmail(
  to: string,
  auditId: string,
  score: number,
  name?: string
): Promise<void> {
  const resend = getResend();
  const greeting = name ? `Hi ${name}` : "Hi there";
  const scoreColor = score >= 70 ? "#10B981" : score >= 40 ? "#F59E0B" : "#EF4444";

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your AI Visibility Score: ${score}/100`,
    html: wrap(
      "Your Audit is Ready",
      `<p>${greeting},</p>
       <p>Your AI Visibility Audit is complete.</p>
       <div style="text-align: center; padding: 24px; background: #F8FAFC; border-radius: 12px; margin: 16px 0;">
         <div style="font-size: 48px; font-weight: 700; color: ${scoreColor};">${score}</div>
         <div style="color: #94A3B8; font-size: 14px;">/100 AI Visibility Score</div>
       </div>
       <p>Your full report includes pillar breakdowns, competitor comparisons, and a prioritized action plan.</p>
       <p style="margin-top: 24px;">
         <a href="https://mentionlayer.com/free-audit/results/${auditId}" style="display: inline-block; padding: 10px 24px; background: #6C5CE7; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">View Full Results</a>
       </p>`
    ),
  });
}

/**
 * Send a confirmation when a user subscribes to a paid plan.
 */
export async function sendPlanActivatedEmail(
  to: string,
  planName: string,
  credits: number,
  name?: string
): Promise<void> {
  const resend = getResend();
  const greeting = name ? `Hi ${name}` : "Hi there";

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your ${planName} plan is active`,
    html: wrap(
      `${planName} Plan Activated!`,
      `<p>${greeting},</p>
       <p>Your <strong>${planName}</strong> plan is now active with <strong>${credits.toLocaleString()} credits</strong> this month.</p>
       <p>Here's what you can do now:</p>
       <ul style="color: #475569; line-height: 1.8;">
         <li><strong>Citation Engine</strong> — Discover and seed high-authority threads</li>
         <li><strong>AI Monitor</strong> — Track your Share of Model across ChatGPT, Perplexity, Gemini</li>
         <li><strong>Entity Sync</strong> — Keep your brand info consistent everywhere</li>
         <li><strong>Review Engine</strong> — Monitor and respond to reviews</li>
       </ul>
       <p style="margin-top: 24px;">
         <a href="https://mentionlayer.com/dashboard" style="display: inline-block; padding: 10px 24px; background: #6C5CE7; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Go to Dashboard</a>
       </p>`
    ),
  });
}
