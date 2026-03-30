"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Check, Circle, ArrowLeft } from "lucide-react";
import type { AcademyCourse } from "@/../content/academy/courses";

interface LessonSidebarProps {
  course: AcademyCourse;
  currentLessonSlug: string;
  completedLessons: string[];
}

export function LessonSidebar({
  course,
  currentLessonSlug,
  completedLessons,
}: LessonSidebarProps) {
  return (
    <nav className="w-60 shrink-0 border-r border-border pr-4">
      <Link
        href={`/dashboard/academy/${course.slug}`}
        className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to {course.title}
      </Link>

      <ul className="space-y-1">
        {course.lessons.map((lesson, idx) => {
          const isCurrent = lesson.slug === currentLessonSlug;
          const isComplete = completedLessons.includes(lesson.slug);

          return (
            <li key={lesson.slug}>
              <Link
                href={`/dashboard/academy/${course.slug}/${lesson.slug}`}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                  isCurrent
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {isComplete ? (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
                    <Check className="h-3 w-3 text-emerald-500" />
                  </div>
                ) : isCurrent ? (
                  <div className="flex h-5 w-5 items-center justify-center">
                    <Circle className="h-3 w-3 fill-primary text-primary" />
                  </div>
                ) : (
                  <div className="flex h-5 w-5 items-center justify-center">
                    <Circle className="h-3 w-3 text-muted-foreground/40" />
                  </div>
                )}
                <span className="truncate">
                  {idx + 1}. {lesson.title}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
