export interface BlogAuthor {
  name: string;
  role: string;
  bio: string;
  url: string;
  image?: string;
  sameAs: string[];
}

export const AUTHORS: Record<string, BlogAuthor> = {
  "joel-house": {
    name: "Joel House",
    role: "Founder, MentionLayer",
    bio: "AI marketing expert, author of AI for Revenue, and founder of MentionLayer. Joel House helps brands and agencies get recommended by AI through Generative Engine Optimization.",
    url: "https://joelhouse.com/about",
    image: "https://mentionlayer.com/authors/joel-house.jpg",
    sameAs: [
      "https://joelhouse.com/about",
      "https://www.linkedin.com/in/joelhouse",
      "https://mentionlayer.com",
    ],
  },
};

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
