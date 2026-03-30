export interface AcademyLesson {
  slug: string;
  title: string;
  description: string;
  estimatedMinutes: number;
}

export interface AcademyCourse {
  slug: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  moduleLink?: string; // Dashboard path this course relates to
  lessons: AcademyLesson[];
  available: boolean;
}

export const courses: AcademyCourse[] = [
  {
    slug: "geo-foundations",
    title: "GEO Foundations",
    description:
      "Understand why AI search is the next frontier and how MentionLayer gives you the tools to win it.",
    icon: "graduation-cap",
    lessons: [
      {
        slug: "what-is-geo",
        title: "What Is GEO?",
        description:
          "Define Generative Engine Optimization and understand the shift from search to AI answers.",
        estimatedMinutes: 8,
      },
      {
        slug: "how-ai-models-find-answers",
        title: "How AI Models Find Answers",
        description:
          "Learn how ChatGPT, Perplexity, Gemini, and others decide what to recommend.",
        estimatedMinutes: 10,
      },
      {
        slug: "five-pillars-of-ai-visibility",
        title: "The Five Pillars of AI Visibility",
        description:
          "Understand the five signals that determine whether AI models mention your brand.",
        estimatedMinutes: 10,
      },
      {
        slug: "geo-vs-traditional-seo",
        title: "GEO vs Traditional SEO",
        description:
          "How GEO and SEO complement each other and why you need both.",
        estimatedMinutes: 7,
      },
      {
        slug: "your-first-audit",
        title: "Running Your First AI Visibility Audit",
        description:
          "Step-by-step walkthrough of the MentionLayer audit and what your scores mean.",
        estimatedMinutes: 8,
      },
    ],
    available: true,
  },
  {
    slug: "ai-monitor-mastery",
    title: "AI Monitor Mastery",
    description:
      "Learn how to track, measure, and improve your brand's presence across every major AI model.",
    icon: "radar",
    moduleLink: "/dashboard/monitor",
    lessons: [
      {
        slug: "understanding-share-of-model",
        title: "Understanding Share of Model",
        description:
          "What SOM is, why it matters, and what good looks like for your industry.",
        estimatedMinutes: 8,
      },
      {
        slug: "setting-up-keywords",
        title: "Setting Up Keywords for Monitoring",
        description:
          "Choose the right keywords and prompt variations for accurate tracking.",
        estimatedMinutes: 7,
      },
      {
        slug: "reading-your-results",
        title: "Reading Your AI Monitor Results",
        description:
          "Understand visibility scores, model breakdowns, and keyword performance.",
        estimatedMinutes: 9,
      },
      {
        slug: "competitor-tracking",
        title: "Competitor Tracking",
        description:
          "Auto-discover competitors and track their AI visibility alongside yours.",
        estimatedMinutes: 7,
      },
      {
        slug: "correlating-actions-to-visibility",
        title: "Correlating Actions to Visibility Changes",
        description:
          "Link your citation seeding and press coverage to measurable SOM improvements.",
        estimatedMinutes: 8,
      },
    ],
    available: false,
  },
  {
    slug: "citation-engine",
    title: "Citation Engine Deep Dive",
    description:
      "Master the art of placing your brand in the conversations that AI models already reference.",
    icon: "message-square-quote",
    moduleLink: "/dashboard/citations",
    lessons: [
      {
        slug: "how-citation-seeding-works",
        title: "How Citation Seeding Works",
        description:
          "The core insight behind citation seeding and the discover-classify-respond pipeline.",
        estimatedMinutes: 8,
      },
      {
        slug: "thread-discovery-explained",
        title: "Thread Discovery Explained",
        description:
          "How MentionLayer finds citation-worthy threads through SERP scanning and AI probing.",
        estimatedMinutes: 9,
      },
      {
        slug: "writing-authentic-responses",
        title: "Writing Authentic Responses",
        description:
          "Platform culture, the 3 variant styles, and what makes a response stick.",
        estimatedMinutes: 10,
      },
      {
        slug: "choosing-which-threads-to-target",
        title: "Choosing Which Threads to Target",
        description:
          "Reading opportunity scores and building an efficient targeting workflow.",
        estimatedMinutes: 7,
      },
      {
        slug: "measuring-citation-impact",
        title: "Measuring Citation Impact",
        description:
          "Track whether your citations lead to AI mentions and build a seeding cadence.",
        estimatedMinutes: 8,
      },
    ],
    available: false,
  },
  {
    slug: "entity-sync",
    title: "Entity Sync Guide",
    description:
      "Ensure your brand's identity is consistent across every platform that AI models reference.",
    icon: "network",
    moduleLink: "/dashboard/entities",
    lessons: [
      {
        slug: "why-entity-consistency-matters",
        title: "Why Entity Consistency Matters for AI",
        description:
          "How AI models cross-reference sources and why inconsistency kills recommendations.",
        estimatedMinutes: 7,
      },
      {
        slug: "canonical-brand-identity",
        title: "Building a Canonical Brand Identity",
        description:
          "Create and manage the single source of truth for your brand description.",
        estimatedMinutes: 8,
      },
      {
        slug: "schema-markup-for-ai",
        title: "Schema Markup for AI Crawlers",
        description:
          "The structured data that AI models love and how to implement it.",
        estimatedMinutes: 9,
      },
      {
        slug: "directory-audit-walkthrough",
        title: "Directory Audit Walkthrough",
        description:
          "Scan, score, and fix your presence across key directories.",
        estimatedMinutes: 8,
      },
      {
        slug: "llms-txt-explained",
        title: "llms.txt Explained",
        description:
          "The emerging standard for machine-readable brand information.",
        estimatedMinutes: 6,
      },
    ],
    available: false,
  },
  {
    slug: "pressforge",
    title: "PressForge Playbook",
    description:
      "Build earned media authority that makes AI models trust and recommend your brand.",
    icon: "newspaper",
    moduleLink: "/dashboard/press",
    lessons: [
      {
        slug: "earned-media-and-ai-authority",
        title: "Earned Media and AI Authority",
        description:
          "Why press coverage is one of the strongest AI ranking signals.",
        estimatedMinutes: 8,
      },
      {
        slug: "building-press-campaigns",
        title: "Building Press Campaigns",
        description:
          "Campaign types, AI-generated ideas, and the campaign workflow.",
        estimatedMinutes: 9,
      },
      {
        slug: "journalist-discovery",
        title: "Journalist Discovery",
        description:
          "Find and score relevant journalists for personalized outreach.",
        estimatedMinutes: 7,
      },
      {
        slug: "pitch-generation",
        title: "AI-Powered Pitch Generation",
        description:
          "Generate personalized pitches using brand voice modeling.",
        estimatedMinutes: 8,
      },
      {
        slug: "tracking-coverage",
        title: "Tracking Press Coverage",
        description:
          "Monitor mentions and measure press impact on AI visibility.",
        estimatedMinutes: 7,
      },
    ],
    available: false,
  },
  {
    slug: "review-engine",
    title: "Review Engine Guide",
    description:
      "Leverage reviews as trust signals that influence how AI models perceive your brand.",
    icon: "star",
    moduleLink: "/dashboard/reviews",
    lessons: [
      {
        slug: "reviews-as-trust-signals",
        title: "Reviews as AI Trust Signals",
        description:
          "Why AI models weight reviews heavily and which platforms matter most.",
        estimatedMinutes: 7,
      },
      {
        slug: "multi-platform-monitoring",
        title: "Multi-Platform Review Monitoring",
        description:
          "Aggregate reviews from Google, Trustpilot, G2, and more in one feed.",
        estimatedMinutes: 8,
      },
      {
        slug: "ai-response-generation",
        title: "AI-Generated Review Responses",
        description:
          "Professional response templates for positive, negative, and neutral reviews.",
        estimatedMinutes: 7,
      },
      {
        slug: "review-campaigns",
        title: "Review Generation Campaigns",
        description:
          "Set up compliant review request campaigns with smart timing.",
        estimatedMinutes: 8,
      },
      {
        slug: "competitor-review-analysis",
        title: "Competitor Review Intelligence",
        description:
          "Track competitor review trends and find sentiment gaps to exploit.",
        estimatedMinutes: 7,
      },
    ],
    available: false,
  },
  {
    slug: "selling-geo",
    title: "Selling GEO to Clients",
    description:
      "Position and sell GEO services to your agency clients using MentionLayer as proof.",
    icon: "briefcase",
    lessons: [
      {
        slug: "pitching-geo-to-clients",
        title: "Pitching GEO to Clients",
        description:
          "The elevator pitch, audit-first sales motion, and handling objections.",
        estimatedMinutes: 9,
      },
      {
        slug: "running-prospect-audits",
        title: "Running Prospect Audits",
        description:
          "Use free audits as a sales tool and convert prospects to paying clients.",
        estimatedMinutes: 8,
      },
      {
        slug: "pricing-geo-services",
        title: "Pricing GEO Services",
        description:
          "Market benchmarks, pricing models, and package tier examples.",
        estimatedMinutes: 8,
      },
      {
        slug: "monthly-reporting",
        title: "Monthly Client Reporting",
        description:
          "What to include in GEO reports and how to present AI Visibility Score trends.",
        estimatedMinutes: 7,
      },
      {
        slug: "case-study-template",
        title: "Building Case Studies",
        description:
          "Template, metrics to highlight, and publishing for your own AI visibility.",
        estimatedMinutes: 7,
      },
    ],
    available: false,
  },
];

// Helper functions

export function getCourse(slug: string): AcademyCourse | undefined {
  return courses.find((c) => c.slug === slug);
}

export function getLesson(
  courseSlug: string,
  lessonSlug: string
): { course: AcademyCourse; lesson: AcademyLesson; lessonIndex: number } | undefined {
  const course = getCourse(courseSlug);
  if (!course) return undefined;
  const lessonIndex = course.lessons.findIndex((l) => l.slug === lessonSlug);
  if (lessonIndex === -1) return undefined;
  return { course, lesson: course.lessons[lessonIndex], lessonIndex };
}

export function getNextLesson(
  courseSlug: string,
  lessonSlug: string
): { courseSlug: string; lessonSlug: string; title: string } | null {
  const result = getLesson(courseSlug, lessonSlug);
  if (!result) return null;
  const { course, lessonIndex } = result;
  if (lessonIndex < course.lessons.length - 1) {
    const next = course.lessons[lessonIndex + 1];
    return { courseSlug, lessonSlug: next.slug, title: next.title };
  }
  return null;
}

export function getPrevLesson(
  courseSlug: string,
  lessonSlug: string
): { courseSlug: string; lessonSlug: string; title: string } | null {
  const result = getLesson(courseSlug, lessonSlug);
  if (!result) return null;
  const { course, lessonIndex } = result;
  if (lessonIndex > 0) {
    const prev = course.lessons[lessonIndex - 1];
    return { courseSlug, lessonSlug: prev.slug, title: prev.title };
  }
  return null;
}
