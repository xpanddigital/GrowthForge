"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { LessonSidebar } from "@/components/academy/lesson-sidebar";
import { NextLessonCta } from "@/components/academy/next-lesson-cta";
import { useAcademyProgress } from "@/hooks/use-academy-progress";
import type { AcademyCourse } from "@/../content/academy/courses";

interface LessonClientShellProps {
  course: AcademyCourse;
  lessonSlug: string;
  estimatedMinutes: number;
  nextLesson: { courseSlug: string; lessonSlug: string; title: string } | null;
  prevLesson: { courseSlug: string; lessonSlug: string; title: string } | null;
  children: React.ReactNode;
}

export function LessonClientShell({
  course,
  lessonSlug,
  estimatedMinutes,
  nextLesson,
  prevLesson,
  children,
}: LessonClientShellProps) {
  const { isLessonComplete, markComplete, markIncomplete, completed, _hasHydrated } =
    useAcademyProgress();

  const completedLessons = _hasHydrated
    ? completed[course.slug] || []
    : [];
  const isComplete = _hasHydrated && isLessonComplete(course.slug, lessonSlug);

  const handleToggleComplete = () => {
    if (isComplete) {
      markIncomplete(course.slug, lessonSlug);
    } else {
      markComplete(course.slug, lessonSlug);
    }
  };

  return (
    <div className="flex gap-8">
      {/* Sidebar — hidden on mobile */}
      <div className="hidden lg:block">
        <LessonSidebar
          course={course}
          currentLessonSlug={lessonSlug}
          completedLessons={completedLessons}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 max-w-3xl">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href="/dashboard/academy"
            className="hover:text-foreground transition-colors"
          >
            Academy
          </Link>
          <span>/</span>
          <Link
            href={`/dashboard/academy/${course.slug}`}
            className="hover:text-foreground transition-colors"
          >
            {course.title}
          </Link>
        </div>

        {/* Lesson meta */}
        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {estimatedMinutes} min read
        </div>

        {/* MDX content */}
        <article>{children}</article>

        {/* Bottom navigation */}
        <NextLessonCta
          courseSlug={course.slug}
          isComplete={isComplete}
          onToggleComplete={handleToggleComplete}
          prevLesson={prevLesson}
          nextLesson={nextLesson}
        />
      </div>
    </div>
  );
}
