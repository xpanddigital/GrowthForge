export interface BlogAuthor {
  slug: string;
  name: string;
  role: string;
  bio: string;
  extendedBio: string; // 200-500 word third-person bio for the /author/ page
  url: string;         // local author page: /author/[slug]
  hub: string;         // external hub: joelhouse.com/about
  image?: string;
  knowsAbout: string[];
  sameAs: string[];
}

export const AUTHORS: Record<string, BlogAuthor> = {
  "joel-house": {
    slug: "joel-house",
    name: "Joel House",
    role: "Founder, MentionLayer",
    bio: "AI marketing expert, author of AI for Revenue, and founder of MentionLayer. Joel House helps brands and agencies get recommended by AI through Generative Engine Optimization.",
    extendedBio: `Joel House is an AI marketing strategist, entrepreneur, and the founder of MentionLayer — the platform that helps brands and agencies get recommended by AI models like ChatGPT, Perplexity, Gemini, and Claude.

Joel has spent over a decade building digital marketing companies and advising brands on organic growth. He is the founder and CEO of Xpand Digital, an agency that has driven measurable results for clients across music, legal, finance, and e-commerce verticals. Recognizing that the search landscape was shifting from ten blue links to AI-generated answers, Joel pioneered Generative Engine Optimization (GEO) — the discipline of optimizing brands to appear in AI responses rather than (or in addition to) traditional search results.

He is the author of AI for Revenue, a practical guide for business owners and marketers on integrating AI into their revenue operations. The book distills Joel's hands-on experience running AI-first campaigns and building the internal tools that eventually became MentionLayer.

MentionLayer operationalizes GEO at scale: seeding citations in high-authority Reddit and Quora threads, auditing AI visibility across five pillars, managing digital PR distribution, and tracking share-of-model across the major AI platforms. Joel built the platform to solve a real problem he faced with his own clients — the inability to measure or influence whether a brand appears when a potential customer asks an AI for a recommendation.

Joel is based in Australia and works with brands and agencies globally. He speaks regularly on the intersection of AI and marketing, and is recognized as one of the early practitioners defining the GEO discipline.`,
    url: "/author/joel-house",
    hub: "https://joelhouse.com/about",
    image: "/authors/joel-house.jpg",
    knowsAbout: [
      "Generative Engine Optimization",
      "AI Visibility",
      "SEO",
      "Digital Marketing",
      "Content Strategy",
      "Forum Citation Building",
      "AI for Revenue",
      "Brand Mentions",
    ],
    sameAs: [
      "https://joelhouse.com/about",
      "https://www.linkedin.com/in/joel-house-seo",
      "https://mentionlayer.com/author/joel-house",
    ],
  },
};

export function getAuthorBySlug(slug: string): BlogAuthor | undefined {
  return AUTHORS[slug];
}

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
