import Link from "next/link";
import type { Metadata } from "next";
import { courses } from "@/../content/academy/courses";
import { CourseJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Academy — Free GEO & AI Visibility Training",
  description:
    "Learn Generative Engine Optimization from scratch. 6 free courses with 30 lessons covering AI visibility, citation seeding, press strategy, and entity optimization.",
  openGraph: {
    title: "Academy — Free GEO & AI Visibility Training | MentionLayer",
    description:
      "6 free courses, 30 lessons. Master AI visibility, citation seeding, press strategy, and Generative Engine Optimization.",
    images: ["/api/og?title=Academy"],
  },
};

const iconMap: Record<string, string> = {
  "graduation-cap": "🎓",
  radar: "📡",
  "message-square-quote": "💬",
  network: "🔗",
  newspaper: "📰",
  star: "⭐",
  briefcase: "💼",
};

export default function AcademyPage() {
  const totalLessons = courses.reduce((n, c) => n + c.lessons.length, 0);
  const totalMinutes = courses.reduce(
    (n, c) => n + c.lessons.reduce((m, l) => m + l.estimatedMinutes, 0),
    0
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <CourseJsonLd
        name="MentionLayer Academy — Free GEO & AI Visibility Training"
        description="Learn Generative Engine Optimization from scratch. 6 free courses, 30 lessons — master AI visibility, citation seeding, press strategy, and more."
        url="/academy"
      />
      <BreadcrumbJsonLd items={[{ name: "Home", url: "/" }, { name: "Academy", url: "/academy" }]} />

      {/* Hero */}
      <div className="text-center">
        <span
          className="inline-block rounded-full px-3.5 py-1.5 text-[13px] font-semibold"
          style={{ background: "rgba(232,114,58,0.12)", color: "var(--warm)" }}
        >
          100% Free
        </span>
        <h1 className="mt-5 text-[36px] sm:text-[48px] tracking-tight" style={{ color: "var(--ink)" }}>
          MentionLayer Academy
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-[17px]" style={{ color: "var(--ink-secondary)" }}>
          Master AI visibility from fundamentals to advanced strategies.{" "}
          {courses.length} courses, {totalLessons} lessons, ~
          {Math.round(totalMinutes / 60)} hours of content — all free.
        </p>
      </div>

      {/* Course grid */}
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => {
          const mins = course.lessons.reduce(
            (m, l) => m + l.estimatedMinutes,
            0
          );
          return (
            <div
              key={course.slug}
              className="group rounded-2xl p-6 transition-all hover:-translate-y-px"
              style={{
                background: "var(--surface-raised)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -4px rgba(0,0,0,0.06)",
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-[28px]">
                  {iconMap[course.icon] || "📚"}
                </span>
                <h2 className="text-[17px] font-semibold" style={{ color: "var(--ink)", fontFamily: "'Outfit', system-ui, sans-serif" }}>
                  {course.title}
                </h2>
              </div>
              <p className="mt-2 text-[14px] line-clamp-2" style={{ color: "var(--ink-secondary)" }}>
                {course.description}
              </p>
              <div className="mt-4 flex items-center gap-3 text-[13px]" style={{ color: "var(--ink-tertiary)" }}>
                <span>{course.lessons.length} lessons</span>
                <span style={{ color: "rgba(26,26,46,0.12)" }}>|</span>
                <span>~{mins} min</span>
              </div>
              {/* Lesson list preview */}
              <ul className="mt-4 space-y-1.5">
                {course.lessons.slice(0, 3).map((lesson) => (
                  <li key={lesson.slug} className="text-[13px]" style={{ color: "var(--ink-secondary)" }}>
                    <span className="mr-1.5" style={{ color: "var(--accent)", opacity: 0.5 }}>▸</span>
                    {lesson.title}
                  </li>
                ))}
                {course.lessons.length > 3 && (
                  <li className="text-[12px]" style={{ color: "var(--ink-tertiary)" }}>
                    +{course.lessons.length - 3} more lessons
                  </li>
                )}
              </ul>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="mt-16 text-center">
        <h2 className="text-[28px] font-semibold tracking-tight" style={{ color: "var(--ink)" }}>
          Ready to put it into practice?
        </h2>
        <p className="mt-2 text-[15px]" style={{ color: "var(--ink-secondary)" }}>
          Sign up for MentionLayer and access the full interactive Academy with
          progress tracking.
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <Link
            href="/free-audit"
            className="h-11 px-6 rounded-lg text-[14px] font-semibold text-white inline-flex items-center"
            style={{ background: "var(--accent)" }}
          >
            Start Free Audit
          </Link>
          <Link
            href="/pricing"
            className="h-11 px-6 rounded-lg text-[14px] font-semibold inline-flex items-center transition-colors"
            style={{ border: "1px solid rgba(26,26,46,0.1)", color: "var(--ink)" }}
          >
            View Plans
          </Link>
        </div>
      </div>
    </div>
  );
}
