"use client";

import Link from "next/link";
import { Check, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface NextLessonCtaProps {
  courseSlug: string;
  isComplete: boolean;
  onToggleComplete: () => void;
  prevLesson: { courseSlug: string; lessonSlug: string; title: string } | null;
  nextLesson: { courseSlug: string; lessonSlug: string; title: string } | null;
}

export function NextLessonCta({
  courseSlug,
  isComplete,
  onToggleComplete,
  prevLesson,
  nextLesson,
}: NextLessonCtaProps) {
  return (
    <div className="mt-12 border-t border-border pt-6">
      <div className="flex items-center justify-between gap-4">
        {/* Previous lesson */}
        <div className="flex-1">
          {prevLesson && (
            <Link
              href={`/dashboard/academy/${prevLesson.courseSlug}/${prevLesson.lessonSlug}`}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{prevLesson.title}</span>
              <span className="sm:hidden">Previous</span>
            </Link>
          )}
        </div>

        {/* Mark complete */}
        <button
          onClick={onToggleComplete}
          className={cn(
            "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            isComplete
              ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          <Check className="h-4 w-4" />
          {isComplete ? "Completed" : "Mark as complete"}
        </button>

        {/* Next lesson */}
        <div className="flex-1 text-right">
          {nextLesson ? (
            <Link
              href={`/dashboard/academy/${nextLesson.courseSlug}/${nextLesson.lessonSlug}`}
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              <span className="hidden sm:inline">{nextLesson.title}</span>
              <span className="sm:hidden">Next lesson</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              href={`/dashboard/academy/${courseSlug}`}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to course
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
