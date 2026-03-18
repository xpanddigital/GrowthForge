import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { functions } from "@/lib/inngest/functions";

// Inngest calls back to this endpoint to run each step.
// Each step can involve multiple AI model API calls (3-10s each),
// so we need the maximum allowed timeout.
export const maxDuration = 300; // 300 seconds (Vercel Pro plan max)

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});
