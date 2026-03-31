import Link from "next/link";
import type { Metadata } from "next";
import { courses } from "@/../content/academy/courses";
import { CourseJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Academy — Free GEO & AI Visibility Training",
  description:
    "Learn Generative Engine Optimization from scratch. 6 free courses, 30 lessons on AI visibility, citation seeding, press strategy, and more.",
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
    <div className="mx-auto max-w-6xl px-4 py-16">
      <CourseJsonLd
        name="MentionLayer Academy — Free GEO & AI Visibility Training"
        description="Learn Generative Engine Optimization from scratch. 6 free courses, 30 lessons — master AI visibility, citation seeding, press strategy, and more."
        url="/academy"
      />
      <BreadcrumbJsonLd items={[{ name: "Home", url: "/" }, { name: "Academy", url: "/academy" }]} />
      {/* Hero */}
      <div className="text-center">
        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          100% Free
        </span>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          MentionLayer Academy
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
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
              className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
            >
              <span className="text-2xl">
                {iconMap[course.icon] || "📚"}
              </span>
              <h2 className="mt-3 text-lg font-semibold">{course.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {course.description}
              </p>
              <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{course.lessons.length} lessons</span>
                <span className="text-border">|</span>
                <span>~{mins} min</span>
              </div>
              {/* Lesson list preview */}
              <ul className="mt-4 space-y-1.5">
                {course.lessons.slice(0, 3).map((lesson) => (
                  <li
                    key={lesson.slug}
                    className="text-sm text-muted-foreground"
                  >
                    <span className="mr-1.5 text-primary/60">&#x25B8;</span>
                    {lesson.title}
                  </li>
                ))}
                {course.lessons.length > 3 && (
                  <li className="text-xs text-muted-foreground/60">
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
        <h2 className="text-2xl font-bold">Ready to put it into practice?</h2>
        <p className="mt-2 text-muted-foreground">
          Sign up for MentionLayer and access the full interactive Academy with
          progress tracking.
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <Link
            href="/free-audit"
            className="rounded-md bg-[#6C5CE7] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5A4BD1]"
          >
            Start Free Audit
          </Link>
          <Link
            href="/pricing"
            className="rounded-md border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            View Plans
          </Link>
        </div>
      </div>
    </div>
  );
}
