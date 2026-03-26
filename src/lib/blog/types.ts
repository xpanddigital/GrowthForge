export interface BlogPost {
  slug: string;
  title: string;
  summary: string;
  metaTitle: string;
  metaDescription: string;
  targetKeyword: string;
  publishedAt: string; // ISO date
  updatedAt?: string;
  author: {
    name: string;
    role: string;
  };
  category: "fundamentals" | "strategy" | "technical" | "industry" | "tools";
  buyingStage: "awareness" | "consideration" | "decision";
  estimatedReadTime: number; // minutes
  relatedSlugs: string[];
  faqs: Array<{ question: string; answer: string }>;
  sections: Array<{
    id: string;
    title: string;
    content: string;
  }>;
  keyTakeaway: string; // TL;DR box at top
}

export const categoryLabels: Record<BlogPost["category"], string> = {
  fundamentals: "Fundamentals",
  strategy: "Strategy",
  technical: "Technical",
  industry: "Industry",
  tools: "Tools & Comparisons",
};

export const stageLabels: Record<BlogPost["buyingStage"], string> = {
  awareness: "Awareness",
  consideration: "Consideration",
  decision: "Decision",
};
